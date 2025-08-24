import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Clock, Calendar, CheckCircle, AlertCircle, Settings, Minimize2 } from 'lucide-react'
import WorklogSuggestions from '@/components/WorklogSuggestions'
import CalendarEvents from '@/components/CalendarEvents'
import ServiceStatus from '@/components/ServiceStatus'
import SettingsModal from '@/components/SettingsModal'
import { healthAPI } from '@/services/api'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

function App() {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'calendar' | 'status'>('suggestions')
  const [showSettings, setShowSettings] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check backend connection
    const checkConnection = async () => {
      try {
        await healthAPI.check()
        setIsConnected(true)
      } catch (error) {
        setIsConnected(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Set up Electron IPC listeners
    if (window.electronAPI) {
      const unsubscribeFetch = window.electronAPI.onFetchSuggestions(() => {
        setActiveTab('suggestions')
      })

      const unsubscribeSettings = window.electronAPI.onOpenSettings(() => {
        setShowSettings(true)
      })

      return () => {
        unsubscribeFetch()
        unsubscribeSettings()
      }
    }
  }, [])

  const handleMinimize = async () => {
    if (window.electronAPI) {
      await window.electronAPI.minimizeToTray()
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-primary-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  ActivityWatch Jira Integration
                </h1>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Connection status */}
                <div className="flex items-center space-x-1">
                  {isConnected ? (
                    <CheckCircle className="w-4 h-4 text-success-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-error-500" />
                  )}
                  <span className={`text-sm ${isConnected ? 'text-success-600' : 'text-error-600'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                {/* Actions */}
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                
                {window.electronAPI && (
                  <button
                    onClick={handleMinimize}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                    title="Minimize to tray"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b">
          <div className="px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'suggestions'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Worklog Suggestions</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'calendar'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Calendar</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('status')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'status'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Status</span>
                </div>
              </button>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 py-6">
          <div className="px-6">
            {activeTab === 'suggestions' && <WorklogSuggestions />}
            {activeTab === 'calendar' && <CalendarEvents />}
            {activeTab === 'status' && <ServiceStatus />}
          </div>
        </main>

        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </QueryClientProvider>
  )
}

export default App