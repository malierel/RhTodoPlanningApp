"""
Calendar service for ICS calendar integration
"""

import os
from datetime import datetime, timedelta
from typing import List, Optional
import httpx
from icalendar import Calendar

from ..models import CalendarEvent


class CalendarService:
    """Service for calendar integration"""
    
    def __init__(self):
        """Initialize calendar service"""
        self.ics_url = os.getenv("ICS_CALENDAR_URL")
        self.refresh_interval = int(os.getenv("CALENDAR_REFRESH_INTERVAL", "300"))
        self._cached_events: List[CalendarEvent] = []
        self._last_refresh: Optional[datetime] = None
    
    async def _fetch_ics_calendar(self) -> Optional[Calendar]:
        """Fetch ICS calendar from URL"""
        if not self.ics_url:
            return None
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.ics_url, timeout=30.0)
                response.raise_for_status()
                
                calendar = Calendar.from_ical(response.content)
                return calendar
                
        except Exception as e:
            print(f"Error fetching ICS calendar: {e}")
            return None
    
    async def _should_refresh(self) -> bool:
        """Check if calendar data should be refreshed"""
        if self._last_refresh is None:
            return True
        
        time_since_refresh = datetime.now() - self._last_refresh
        return time_since_refresh.total_seconds() > self.refresh_interval
    
    async def get_events(
        self, 
        start_time: datetime, 
        end_time: datetime,
        force_refresh: bool = False
    ) -> List[CalendarEvent]:
        """Get calendar events for the specified time range"""
        if force_refresh or await self._should_refresh():
            await self._refresh_events()
        
        # Filter cached events by time range
        filtered_events = []
        for event in self._cached_events:
            if (event.start <= end_time and event.end >= start_time):
                filtered_events.append(event)
        
        return filtered_events
    
    async def _refresh_events(self) -> None:
        """Refresh calendar events from ICS source"""
        try:
            calendar = await self._fetch_ics_calendar()
            if not calendar:
                return
            
            events = []
            for component in calendar.walk():
                if component.name == "VEVENT":
                    # Extract event data
                    uid = str(component.get('uid', ''))
                    summary = str(component.get('summary', ''))
                    description = str(component.get('description', '')) if component.get('description') else None
                    
                    # Handle datetime
                    dtstart = component.get('dtstart')
                    dtend = component.get('dtend')
                    
                    if dtstart and dtend:
                        start = dtstart.dt
                        end = dtend.dt
                        
                        # Convert to datetime if date
                        if hasattr(start, 'date') and not hasattr(start, 'hour'):
                            start = datetime.combine(start, datetime.min.time())
                        if hasattr(end, 'date') and not hasattr(end, 'hour'):
                            end = datetime.combine(end, datetime.min.time())
                        
                        # Extract attendees
                        attendees = []
                        attendee_props = component.get('attendee')
                        if attendee_props:
                            if isinstance(attendee_props, list):
                                attendees = [str(att) for att in attendee_props]
                            else:
                                attendees = [str(attendee_props)]
                        
                        # Extract location
                        location = str(component.get('location', '')) if component.get('location') else None
                        
                        event = CalendarEvent(
                            uid=uid,
                            summary=summary,
                            description=description,
                            start=start,
                            end=end,
                            location=location,
                            attendees=attendees
                        )
                        events.append(event)
            
            self._cached_events = events
            self._last_refresh = datetime.now()
            print(f"Refreshed {len(events)} calendar events")
            
        except Exception as e:
            print(f"Error refreshing calendar events: {e}")
    
    async def get_today_events(self) -> List[CalendarEvent]:
        """Get today's calendar events"""
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)
        return await self.get_events(today, tomorrow)
    
    async def get_work_events(
        self, 
        start_time: datetime, 
        end_time: datetime,
        work_keywords: Optional[List[str]] = None
    ) -> List[CalendarEvent]:
        """Get work-related calendar events"""
        events = await self.get_events(start_time, end_time)
        
        if not work_keywords:
            work_keywords = ["meeting", "standup", "review", "planning", "development"]
        
        work_events = []
        for event in events:
            # Check if event contains work-related keywords
            text_to_check = f"{event.summary} {event.description or ''}".lower()
            
            if any(keyword.lower() in text_to_check for keyword in work_keywords):
                work_events.append(event)
        
        return work_events
    
    async def test_connection(self) -> bool:
        """Test calendar connection"""
        try:
            calendar = await self._fetch_ics_calendar()
            return calendar is not None
        except Exception as e:
            print(f"Calendar connection test failed: {e}")
            return False