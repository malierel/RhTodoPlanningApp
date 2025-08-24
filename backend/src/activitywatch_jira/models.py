"""
Pydantic models for the ActivityWatch Jira Integration
"""

from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ActivityEvent(BaseModel):
    """ActivityWatch event model"""
    model_config = ConfigDict(from_attributes=True)
    
    timestamp: datetime
    duration: float
    data: dict[str, str | int | float]


class WorklogSuggestion(BaseModel):
    """Worklog suggestion model"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str = Field(..., description="Unique suggestion ID")
    jira_key: str = Field(..., description="Jira issue key (e.g., PROJ-123)")
    summary: str = Field(..., description="Issue summary")
    description: str = Field(..., description="Suggested worklog description")
    time_spent: timedelta = Field(..., description="Suggested time spent")
    start_time: datetime = Field(..., description="Suggested start time")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score 0-1")
    activity_data: dict[str, str | int | float] = Field(default_factory=dict)


class WorklogApproval(BaseModel):
    """Worklog approval request"""
    model_config = ConfigDict(from_attributes=True)
    
    suggestion_id: str
    approved: bool
    time_spent: Optional[timedelta] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None


class JiraIssue(BaseModel):
    """Jira issue model"""
    model_config = ConfigDict(from_attributes=True)
    
    key: str
    summary: str
    description: Optional[str] = None
    status: str
    assignee: Optional[str] = None
    project: str


class CalendarEvent(BaseModel):
    """Calendar event model"""
    model_config = ConfigDict(from_attributes=True)
    
    uid: str
    summary: str
    description: Optional[str] = None
    start: datetime
    end: datetime
    location: Optional[str] = None
    attendees: List[str] = Field(default_factory=list)


class WorklogEntry(BaseModel):
    """Jira worklog entry"""
    model_config = ConfigDict(from_attributes=True)
    
    id: Optional[str] = None
    issue_key: str
    time_spent: timedelta
    description: str
    started: datetime
    author: str


class ServiceStatus(BaseModel):
    """Service status model"""
    model_config = ConfigDict(from_attributes=True)
    
    service: str
    status: str
    last_check: datetime
    error_message: Optional[str] = None


class UserPreferences(BaseModel):
    """User preferences model"""
    model_config = ConfigDict(from_attributes=True)
    
    auto_approve_threshold: float = Field(default=0.9, ge=0, le=1)
    minimum_time_threshold: timedelta = Field(default=timedelta(minutes=15))
    exclude_keywords: List[str] = Field(default_factory=list)
    include_keywords: List[str] = Field(default_factory=list)
    default_description_template: str = Field(default="Working on {issue_key}: {summary}")