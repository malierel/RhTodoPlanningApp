"""
API endpoints for worklog suggestions and management
"""

from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse

from ..models import WorklogSuggestion, WorklogApproval, WorklogEntry
from ..services.activitywatch import ActivityWatchService
from ..services.jira import JiraService


router = APIRouter()


def get_aw_service(request: Request) -> ActivityWatchService:
    """Dependency to get ActivityWatch service"""
    return request.app.state.aw_service


def get_jira_service(request: Request) -> JiraService:
    """Dependency to get Jira service"""
    return request.app.state.jira_service


@router.get("/suggestions", response_model=List[WorklogSuggestion])
async def get_worklog_suggestions(
    start_date: str = None,
    end_date: str = None,
    aw_service: ActivityWatchService = Depends(get_aw_service),
    jira_service: JiraService = Depends(get_jira_service)
):
    """Get worklog suggestions based on ActivityWatch data"""
    try:
        # Parse dates or default to today
        if start_date:
            start_time = datetime.fromisoformat(start_date)
        else:
            start_time = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        if end_date:
            end_time = datetime.fromisoformat(end_date)
        else:
            end_time = start_time + timedelta(days=1)
        
        # Get ActivityWatch events
        events = await aw_service.get_work_sessions(start_time, end_time)
        
        # Get assigned Jira issues
        issues = await jira_service.get_assigned_issues()
        issue_map = {issue.key: issue for issue in issues}
        
        # Generate suggestions
        suggestions = []
        suggestion_id = 1
        
        for event in events:
            # Simple heuristic: look for Jira keys in window titles or app names
            activity_text = " ".join(str(v) for v in event.data.values()).lower()
            
            matched_issues = []
            for issue_key in issue_map.keys():
                if issue_key.lower() in activity_text:
                    matched_issues.append(issue_key)
            
            # If no direct match, suggest most recent issue
            if not matched_issues and issues:
                matched_issues = [issues[0].key]
            
            for issue_key in matched_issues:
                issue = issue_map[issue_key]
                
                suggestion = WorklogSuggestion(
                    id=str(suggestion_id),
                    jira_key=issue_key,
                    summary=issue.summary,
                    description=f"Working on {issue_key}: {issue.summary}",
                    time_spent=timedelta(seconds=event.duration),
                    start_time=event.timestamp,
                    confidence=0.8 if issue_key.lower() in activity_text else 0.5,
                    activity_data=event.data
                )
                suggestions.append(suggestion)
                suggestion_id += 1
        
        return suggestions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating suggestions: {str(e)}")


@router.post("/approve", response_model=WorklogEntry)
async def approve_worklog(
    approval: WorklogApproval,
    jira_service: JiraService = Depends(get_jira_service)
):
    """Approve and create a worklog entry"""
    try:
        # For now, we need to extract the issue key from the suggestion
        # In a real implementation, you'd store suggestions with their data
        # This is a simplified version
        
        # Extract issue key from suggestion ID (this is a placeholder)
        # In practice, you'd retrieve the full suggestion data
        suggestion_data = {
            "jira_key": "EXAMPLE-123",  # This should come from stored suggestion
            "time_spent": approval.time_spent or timedelta(hours=1),
            "description": approval.description or "Work on issue",
            "start_time": approval.start_time or datetime.now()
        }
        
        if not approval.approved:
            return JSONResponse(
                status_code=200,
                content={"message": "Worklog suggestion rejected"}
            )
        
        # Create the worklog in Jira
        worklog = await jira_service.create_worklog(
            issue_key=suggestion_data["jira_key"],
            time_spent=suggestion_data["time_spent"],
            description=suggestion_data["description"],
            started=suggestion_data["start_time"]
        )
        
        if not worklog:
            raise HTTPException(status_code=500, detail="Failed to create worklog in Jira")
        
        return worklog
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving worklog: {str(e)}")


@router.get("/recent", response_model=List[WorklogEntry])
async def get_recent_worklogs(
    days: int = 7,
    jira_service: JiraService = Depends(get_jira_service)
):
    """Get recent worklog entries (placeholder - requires Jira worklog history API)"""
    try:
        # This is a placeholder - actual implementation would fetch from Jira
        # The python-jira library would need additional methods for worklog history
        return []
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving recent worklogs: {str(e)}")


@router.get("/issues", response_model=List[dict])
async def get_assigned_issues(
    jira_service: JiraService = Depends(get_jira_service)
):
    """Get issues assigned to current user"""
    try:
        issues = await jira_service.get_assigned_issues()
        return [
            {
                "key": issue.key,
                "summary": issue.summary,
                "status": issue.status,
                "project": issue.project
            }
            for issue in issues
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving issues: {str(e)}")