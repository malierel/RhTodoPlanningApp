"""
ActivityWatch service for retrieving activity data
"""

import os
from datetime import datetime, timedelta
from typing import List, Optional
import asyncio
from aw_client import ActivityWatchClient

from ..models import ActivityEvent


class ActivityWatchService:
    """Service for interacting with ActivityWatch"""
    
    def __init__(self):
        """Initialize ActivityWatch client"""
        self.server_url = os.getenv("AW_SERVER_URL", "http://localhost:5600")
        self.bucket_name = os.getenv("AW_BUCKET_NAME", "aw-watcher-window")
        self.client: Optional[ActivityWatchClient] = None
    
    async def _get_client(self) -> ActivityWatchClient:
        """Get or create ActivityWatch client"""
        if self.client is None:
            # Run client creation in thread pool since it's not async
            loop = asyncio.get_event_loop()
            self.client = await loop.run_in_executor(
                None, 
                lambda: ActivityWatchClient(host=self.server_url)
            )
        return self.client
    
    async def test_connection(self) -> bool:
        """Test connection to ActivityWatch server"""
        try:
            client = await self._get_client()
            # Run in thread pool since aw-client is synchronous
            loop = asyncio.get_event_loop()
            info = await loop.run_in_executor(None, client.get_info)
            return info is not None
        except Exception as e:
            print(f"ActivityWatch connection test failed: {e}")
            return False
    
    async def get_events(
        self, 
        start_time: datetime, 
        end_time: datetime,
        bucket_name: Optional[str] = None
    ) -> List[ActivityEvent]:
        """Get events from ActivityWatch for the specified time range"""
        try:
            client = await self._get_client()
            bucket = bucket_name or self.bucket_name
            
            # Run in thread pool since aw-client is synchronous
            loop = asyncio.get_event_loop()
            events = await loop.run_in_executor(
                None,
                lambda: client.get_events(bucket, start=start_time, end=end_time)
            )
            
            # Convert to our model
            activity_events = []
            for event in events:
                activity_event = ActivityEvent(
                    timestamp=event.timestamp,
                    duration=event.duration.total_seconds(),
                    data=event.data
                )
                activity_events.append(activity_event)
            
            return activity_events
            
        except Exception as e:
            print(f"Error retrieving ActivityWatch events: {e}")
            return []
    
    async def get_buckets(self) -> List[str]:
        """Get available ActivityWatch buckets"""
        try:
            client = await self._get_client()
            loop = asyncio.get_event_loop()
            buckets = await loop.run_in_executor(None, client.get_buckets)
            return list(buckets.keys())
        except Exception as e:
            print(f"Error retrieving ActivityWatch buckets: {e}")
            return []
    
    async def get_today_events(self) -> List[ActivityEvent]:
        """Get today's events from ActivityWatch"""
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)
        return await self.get_events(today, tomorrow)
    
    async def get_work_sessions(
        self, 
        start_time: datetime, 
        end_time: datetime,
        min_duration_minutes: int = 15
    ) -> List[ActivityEvent]:
        """Get work sessions (filtered and grouped events)"""
        events = await self.get_events(start_time, end_time)
        
        # Filter events by minimum duration
        work_events = [
            event for event in events 
            if event.duration >= min_duration_minutes * 60
        ]
        
        # TODO: Add grouping logic for similar activities
        # TODO: Add filtering for work-related activities
        
        return work_events