import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, MapPin, Users, RefreshCw, AlertCircle } from 'lucide-react'
import { calendarAPI } from '@/services/api'
import type { CalendarEvent } from '@/types/api'

const CalendarEvents: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [showWorkOnly, setShowWorkOnly] = useState(true)

  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ['calendar-events', selectedDate, showWorkOnly],
    queryFn: () => {
      const startDate = selectedDate + 'T00:00:00'
      const endDate = selectedDate + 'T23:59:59'
      
      if (showWorkOnly) {
        return calendarAPI.getWorkEvents(startDate, endDate)
      }
      return calendarAPI.getEvents(startDate, endDate)
    },
    enabled: !!selectedDate,
  })

  const { data: calendarStatus } = useQuery({
    queryKey: ['calendar-status'],
    queryFn: calendarAPI.getStatus,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return timeString
    }
  }

  const formatDuration = (start: string, end: string) => {
    try {
      const startTime = new Date(start)
      const endTime = new Date(end)
      const durationMs = endTime.getTime() - startTime.getTime()
      const hours = Math.floor(durationMs / (1000 * 60 * 60))
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`
      }
      return `${minutes}m`
    } catch {
      return 'Unknown duration'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading calendar events...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-error-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-error-800">
              Error loading calendar events
            </h3>
            <div className="mt-2 text-sm text-error-700">
              {calendarStatus?.connected === false 
                ? 'Calendar service is not configured or unavailable.'
                : 'Failed to load calendar events. Please try again.'
              }
            </div>
            <div className="mt-4">
              <button
                onClick={() => refetch()}
                className="bg-error-100 hover:bg-error-200 text-error-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Calendar Events</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              id="work-only"
              type="checkbox"
              checked={showWorkOnly}
              onChange={(e) => setShowWorkOnly(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="work-only" className="text-sm text-gray-700">
              Work events only
            </label>
          </div>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
          
          <button
            onClick={() => refetch()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Calendar Status */}
      {calendarStatus && (
        <div className={`p-3 rounded-md text-sm ${
          calendarStatus.connected 
            ? 'bg-success-50 text-success-700 border border-success-200'
            : 'bg-warning-50 text-warning-700 border border-warning-200'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              calendarStatus.connected ? 'bg-success-500' : 'bg-warning-500'
            }`} />
            <span>
              Calendar: {calendarStatus.connected ? 'Connected' : 'Disconnected'}
              {calendarStatus.cached_events && (
                <span className="ml-2">({calendarStatus.cached_events} cached events)</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Events */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No {showWorkOnly ? 'work ' : ''}events found for {selectedDate}.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.uid}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {event.summary}
                  </h3>
                  
                  {event.description && (
                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </span>
                      <span className="text-gray-400">
                        ({formatDuration(event.start, event.end)})
                      </span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees.length} attendees</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CalendarEvents