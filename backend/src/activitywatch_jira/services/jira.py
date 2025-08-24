"""
Jira service for interacting with Jira API
"""

import os
from datetime import datetime, timedelta
from typing import List, Optional
import httpx
from jira import JIRA

from ..models import JiraIssue, WorklogEntry, WorklogSuggestion


class JiraService:
    """Service for interacting with Jira API"""
    
    def __init__(self):
        """Initialize Jira client"""
        self.server_url = os.getenv("JIRA_SERVER_URL")
        self.email = os.getenv("JIRA_EMAIL")
        self.api_token = os.getenv("JIRA_API_TOKEN")
        self.client: Optional[JIRA] = None
    
    def _get_client(self) -> Optional[JIRA]:
        """Get or create Jira client"""
        if not all([self.server_url, self.email, self.api_token]):
            print("Jira credentials not configured")
            return None
            
        if self.client is None:
            try:
                self.client = JIRA(
                    server=self.server_url,
                    basic_auth=(self.email, self.api_token)
                )
            except Exception as e:
                print(f"Failed to create Jira client: {e}")
                return None
        
        return self.client
    
    async def test_connection(self) -> bool:
        """Test connection to Jira"""
        try:
            client = self._get_client()
            if not client:
                return False
            
            # Test by getting current user
            user = client.current_user()
            return user is not None
        except Exception as e:
            print(f"Jira connection test failed: {e}")
            return False
    
    async def get_assigned_issues(self, limit: int = 50) -> List[JiraIssue]:
        """Get issues assigned to current user"""
        try:
            client = self._get_client()
            if not client:
                return []
            
            # Search for issues assigned to current user
            issues = client.search_issues(
                'assignee = currentUser() AND resolution = Unresolved',
                maxResults=limit
            )
            
            jira_issues = []
            for issue in issues:
                jira_issue = JiraIssue(
                    key=issue.key,
                    summary=issue.fields.summary,
                    description=getattr(issue.fields, 'description', None),
                    status=issue.fields.status.name,
                    assignee=issue.fields.assignee.displayName if issue.fields.assignee else None,
                    project=issue.fields.project.key
                )
                jira_issues.append(jira_issue)
            
            return jira_issues
            
        except Exception as e:
            print(f"Error retrieving Jira issues: {e}")
            return []
    
    async def search_issues(self, query: str, limit: int = 20) -> List[JiraIssue]:
        """Search Jira issues with JQL query"""
        try:
            client = self._get_client()
            if not client:
                return []
            
            issues = client.search_issues(query, maxResults=limit)
            
            jira_issues = []
            for issue in issues:
                jira_issue = JiraIssue(
                    key=issue.key,
                    summary=issue.fields.summary,
                    description=getattr(issue.fields, 'description', None),
                    status=issue.fields.status.name,
                    assignee=issue.fields.assignee.displayName if issue.fields.assignee else None,
                    project=issue.fields.project.key
                )
                jira_issues.append(jira_issue)
            
            return jira_issues
            
        except Exception as e:
            print(f"Error searching Jira issues: {e}")
            return []
    
    async def create_worklog(
        self, 
        issue_key: str, 
        time_spent: timedelta,
        description: str,
        started: datetime
    ) -> Optional[WorklogEntry]:
        """Create a worklog entry in Jira"""
        try:
            client = self._get_client()
            if not client:
                return None
            
            # Convert timedelta to Jira time format (e.g., "2h 30m")
            total_minutes = int(time_spent.total_seconds() / 60)
            hours = total_minutes // 60
            minutes = total_minutes % 60
            
            time_spent_str = ""
            if hours > 0:
                time_spent_str += f"{hours}h"
            if minutes > 0:
                time_spent_str += f" {minutes}m"
            time_spent_str = time_spent_str.strip()
            
            if not time_spent_str:
                time_spent_str = "1m"  # Minimum time
            
            # Create worklog
            worklog = client.add_worklog(
                issue=issue_key,
                timeSpent=time_spent_str,
                comment=description,
                started=started
            )
            
            # Convert back to our model
            worklog_entry = WorklogEntry(
                id=worklog.id,
                issue_key=issue_key,
                time_spent=time_spent,
                description=description,
                started=started,
                author=worklog.author.displayName
            )
            
            return worklog_entry
            
        except Exception as e:
            print(f"Error creating Jira worklog: {e}")
            return None
    
    async def get_issue(self, issue_key: str) -> Optional[JiraIssue]:
        """Get a specific Jira issue"""
        try:
            client = self._get_client()
            if not client:
                return None
            
            issue = client.issue(issue_key)
            
            jira_issue = JiraIssue(
                key=issue.key,
                summary=issue.fields.summary,
                description=getattr(issue.fields, 'description', None),
                status=issue.fields.status.name,
                assignee=issue.fields.assignee.displayName if issue.fields.assignee else None,
                project=issue.fields.project.key
            )
            
            return jira_issue
            
        except Exception as e:
            print(f"Error retrieving Jira issue {issue_key}: {e}")
            return None