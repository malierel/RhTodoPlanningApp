import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, CheckCircle, X, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react'
import { worklogAPI } from '@/services/api'
import type { WorklogSuggestion, WorklogApproval } from '@/types/api'

const WorklogSuggestions: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  
  const queryClient = useQueryClient()

  const { data: suggestions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['worklog-suggestions', selectedDate],
    queryFn: () => worklogAPI.getSuggestions(selectedDate + 'T00:00:00', selectedDate + 'T23:59:59'),
    enabled: !!selectedDate,
  })

  const approveMutation = useMutation({
    mutationFn: worklogAPI.approveWorklog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worklog-suggestions'] })
      if (window.electronAPI) {
        window.electronAPI.showNotification(
          'Worklog Created',
          'Your worklog has been successfully created in Jira!'
        )
      }
    },
    onError: (error) => {
      console.error('Failed to approve worklog:', error)
      if (window.electronAPI) {
        window.electronAPI.showNotification(
          'Error',
          'Failed to create worklog. Please check your Jira configuration.'
        )
      }
    },
  })

  const handleApprove = (suggestion: WorklogSuggestion) => {
    const approval: WorklogApproval = {
      suggestion_id: suggestion.id,
      approved: true,
      time_spent: suggestion.time_spent,
      description: suggestion.description,
      start_time: suggestion.start_time,
    }
    approveMutation.mutate(approval)
  }

  const handleReject = (suggestion: WorklogSuggestion) => {
    const approval: WorklogApproval = {
      suggestion_id: suggestion.id,
      approved: false,
    }
    approveMutation.mutate(approval)
  }

  const formatDuration = (duration: string) => {
    // Convert ISO 8601 duration to human readable
    try {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (!match) return duration
      
      const hours = parseInt(match[1] || '0')
      const minutes = parseInt(match[2] || '0')
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`
      }
      return `${minutes}m`
    } catch {
      return duration
    }
  }

  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeString
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success-600 bg-success-50'
    if (confidence >= 0.6) return 'text-warning-600 bg-warning-50'
    return 'text-error-600 bg-error-50'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading suggestions...</span>
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
              Error loading suggestions
            </h3>
            <div className="mt-2 text-sm text-error-700">
              Failed to connect to the backend service. Please ensure the service is running.
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
        <h2 className="text-lg font-medium text-gray-900">Worklog Suggestions</h2>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            onClick={() => refetch()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No suggestions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No activity data found for {selectedDate}. Make sure ActivityWatch is running.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {suggestion.jira_key}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}
                    >
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {suggestion.summary}
                  </h3>
                  
                  <p className="text-gray-700 mb-4">
                    {suggestion.description}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(suggestion.time_spent)}</span>
                    </div>
                    <div>
                      Started at {formatTime(suggestion.start_time)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleReject(suggestion)}
                    disabled={approveMutation.isPending}
                    className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 rounded-md disabled:opacity-50"
                    title="Reject suggestion"
                  >
                    <ThumbsDown className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => handleApprove(suggestion)}
                    disabled={approveMutation.isPending}
                    className="p-2 text-gray-400 hover:text-success-500 hover:bg-success-50 rounded-md disabled:opacity-50"
                    title="Approve and create worklog"
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WorklogSuggestions