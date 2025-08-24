import React, { useState } from 'react'
import { X, Save, Settings } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    autoApproveThreshold: 90,
    minimumTimeMinutes: 15,
    excludeKeywords: 'personal,break,lunch',
    includeKeywords: 'development,meeting,review',
    apiBaseUrl: 'http://localhost:8000',
    awServerUrl: 'http://localhost:5600',
    jiraServerUrl: '',
    jiraEmail: '',
    jiraApiToken: '',
    icsCalendarUrl: '',
    refreshInterval: 300,
  })

  const handleSave = () => {
    // In a real app, save settings to local storage or backend
    localStorage.setItem('app-settings', JSON.stringify(settings))
    onClose()
    
    if (window.electronAPI) {
      window.electronAPI.showNotification(
        'Settings Saved',
        'Your settings have been saved successfully.'
      )
    }
  }

  const handleReset = () => {
    localStorage.removeItem('app-settings')
    setSettings({
      autoApproveThreshold: 90,
      minimumTimeMinutes: 15,
      excludeKeywords: 'personal,break,lunch',
      includeKeywords: 'development,meeting,review',
      apiBaseUrl: 'http://localhost:8000',
      awServerUrl: 'http://localhost:5600',
      jiraServerUrl: '',
      jiraEmail: '',
      jiraApiToken: '',
      icsCalendarUrl: '',
      refreshInterval: 300,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* General Settings */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">General</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto-approve threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.autoApproveThreshold}
                  onChange={(e) => setSettings({ ...settings, autoApproveThreshold: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Automatically approve suggestions with confidence above this threshold
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum time (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.minimumTimeMinutes}
                  onChange={(e) => setSettings({ ...settings, minimumTimeMinutes: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum activity duration to suggest as worklog
                </p>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Keywords</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exclude keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={settings.excludeKeywords}
                  onChange={(e) => setSettings({ ...settings, excludeKeywords: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="personal,break,lunch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Include keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={settings.includeKeywords}
                  onChange={(e) => setSettings({ ...settings, includeKeywords: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="development,meeting,review"
                />
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">API Configuration</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backend API URL
                </label>
                <input
                  type="url"
                  value={settings.apiBaseUrl}
                  onChange={(e) => setSettings({ ...settings, apiBaseUrl: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ActivityWatch Server URL
                </label>
                <input
                  type="url"
                  value={settings.awServerUrl}
                  onChange={(e) => setSettings({ ...settings, awServerUrl: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Jira Configuration */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Jira Configuration</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jira Server URL
                </label>
                <input
                  type="url"
                  value={settings.jiraServerUrl}
                  onChange={(e) => setSettings({ ...settings, jiraServerUrl: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://your-company.atlassian.net"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.jiraEmail}
                  onChange={(e) => setSettings({ ...settings, jiraEmail: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="your-email@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Token
                </label>
                <input
                  type="password"
                  value={settings.jiraApiToken}
                  onChange={(e) => setSettings({ ...settings, jiraApiToken: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Your Jira API token"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Generate at: Account Settings → Security → API tokens
                </p>
              </div>
            </div>
          </div>

          {/* Calendar Configuration */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Calendar Configuration</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ICS Calendar URL
                </label>
                <input
                  type="url"
                  value={settings.icsCalendarUrl}
                  onChange={(e) => setSettings({ ...settings, icsCalendarUrl: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://calendar.example.com/calendar.ics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refresh interval (seconds)
                </label>
                <input
                  type="number"
                  min="60"
                  value={settings.refreshInterval}
                  onChange={(e) => setSettings({ ...settings, refreshInterval: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Reset to defaults
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal