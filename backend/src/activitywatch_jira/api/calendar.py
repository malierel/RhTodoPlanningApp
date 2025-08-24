"""
API endpoints for calendar integration
"""

from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, HTTPException, Request, Depends

from ..models import CalendarEvent
from ..services.calendar import CalendarService


router = APIRouter()


def get_calendar_service(request: Request) -> CalendarService:
    """Dependency to get Calendar service"""
    return request.app.state.calendar_service


@router.get("/events", response_model=List[CalendarEvent])
async def get_calendar_events(
    start_date: str = None,
    end_date: str = None,
    calendar_service: CalendarService = Depends(get_calendar_service)
):
    """Get calendar events for date range"""
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
        
        events = await calendar_service.get_events(start_time, end_time)
        return events
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving calendar events: {str(e)}")


@router.get("/today", response_model=List[CalendarEvent])
async def get_today_events(
    calendar_service: CalendarService = Depends(get_calendar_service)
):
    """Get today's calendar events"""
    try:
        events = await calendar_service.get_today_events()
        return events
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving today's events: {str(e)}")


@router.get("/work-events", response_model=List[CalendarEvent])
async def get_work_events(
    start_date: str = None,
    end_date: str = None,
    calendar_service: CalendarService = Depends(get_calendar_service)
):
    """Get work-related calendar events"""
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
        
        events = await calendar_service.get_work_events(start_time, end_time)
        return events
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving work events: {str(e)}")


@router.post("/refresh")
async def refresh_calendar(
    calendar_service: CalendarService = Depends(get_calendar_service)
):
    """Force refresh calendar data"""
    try:
        await calendar_service.get_events(
            datetime.now() - timedelta(days=30),
            datetime.now() + timedelta(days=30),
            force_refresh=True
        )
        return {"message": "Calendar refreshed successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing calendar: {str(e)}")


@router.get("/status")
async def get_calendar_status(
    calendar_service: CalendarService = Depends(get_calendar_service)
):
    """Get calendar service status"""
    try:
        is_connected = await calendar_service.test_connection()
        return {
            "connected": is_connected,
            "service": "calendar",
            "last_refresh": calendar_service._last_refresh.isoformat() if calendar_service._last_refresh else None,
            "cached_events": len(calendar_service._cached_events)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking calendar status: {str(e)}")