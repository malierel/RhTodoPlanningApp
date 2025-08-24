import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, AlertCircle, XCircle, RefreshCw, Clock, Calendar, Settings } from 'lucide-react'
import { healthAPI, calendarAPI } from '@/services/api'

const ServiceStatus: React.FC = () => {
  const { data: healthStatus, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['health-status'],
    queryFn: healthAPI.check,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: calendarStatus, isLoading: calendarLoading, refetch: refetchCalendar } = useQuery({
    queryKey: ['calendar-status'],
    queryFn: calendarAPI.getStatus,
    refetchInterval: 30000,
  })

  const services = [
    {
      name: 'Backend API',
      status: healthStatus ? 'healthy' : 'error',
      icon: Settings,
      description: 'FastAPI backend service',
      lastCheck: new Date().toISOString(),
      details: healthStatus ? 'Service is running' : 'Service unavailable',
      isLoading: healthLoading,
      onRefresh: refetchHealth,
    },
    {
      name: 'ActivityWatch',
      status: 'unknown', // This would need to be implemented in the backend
      icon: Clock,
      description: 'ActivityWatch data service',
      lastCheck: new Date().toISOString(),
      details: 'Connection status unknown',
      isLoading: false,
      onRefresh: () => {},
    },
    {
      name: 'Calendar Service',
      status: calendarStatus?.connected ? 'healthy' : 'error',
      icon: Calendar,
      description: 'ICS calendar integration',
      lastCheck: calendarStatus?.last_refresh || new Date().toISOString(),
      details: calendarStatus?.connected 
        ? `${calendarStatus.cached_events || 0} events cached`
        : 'Calendar not configured or unavailable',
      isLoading: calendarLoading,
      onRefresh: refetchCalendar,
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-success-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-error-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-warning-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-success-700 bg-success-50 border-success-200'
      case 'error':
        return 'text-error-700 bg-error-50 border-error-200'
      default:
        return 'text-warning-700 bg-warning-50 border-warning-200'
    }
  }

  const formatLastCheck = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours}h ago`
      
      return date.toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Service Status</h2>
        <button
          onClick={() => {
            refetchHealth()
            refetchCalendar()
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh All</span>
        </button>
      </div>

      {/* Overall Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          {services.every(s => s.status === 'healthy') ? (
            <>
              <CheckCircle className="w-6 h-6 text-success-500" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">All Systems Operational</h3>
                <p className="text-sm text-gray-500">All services are running normally.</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 text-warning-500" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Some Services Need Attention</h3>
                <p className="text-sm text-gray-500">One or more services are experiencing issues.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Individual Services */}
      <div className="grid gap-4">
        {services.map((service) => (
          <div
            key={service.name}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <service.icon className="w-6 h-6 text-gray-400" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {service.name}
                    </h3>
                    {service.isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    ) : (
                      getStatusIcon(service.status)
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3">
                    {service.description}
                  </p>
                  
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                    {service.status === 'healthy' ? 'Healthy' : 
                     service.status === 'error' ? 'Error' : 'Unknown'}
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600">
                    <p><strong>Details:</strong> {service.details}</p>
                    <p><strong>Last checked:</strong> {formatLastCheck(service.lastCheck)}</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={service.onRefresh}
                disabled={service.isLoading}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md disabled:opacity-50"
                title="Refresh status"
              >
                <RefreshCw className={`w-4 h-4 ${service.isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Help */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration Help</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div>
            <strong>ActivityWatch:</strong> Ensure ActivityWatch is running locally on port 5600.
            Visit <code className="bg-white px-1 rounded">http://localhost:5600</code> to verify.
          </div>
          <div>
            <strong>Calendar:</strong> Configure the ICS_CALENDAR_URL in your .env file to enable calendar integration.
          </div>
          <div>
            <strong>Jira:</strong> Set JIRA_SERVER_URL, JIRA_EMAIL, and JIRA_API_TOKEN in your .env file.
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceStatus