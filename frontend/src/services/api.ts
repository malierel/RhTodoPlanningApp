import axios from 'axios'
import type { WorklogSuggestion, WorklogApproval, JiraIssue, CalendarEvent } from '@/types/api'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Worklog API
export const worklogAPI = {
  getSuggestions: async (startDate?: string, endDate?: string): Promise<WorklogSuggestion[]> => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    
    const response = await api.get(`/api/worklogs/suggestions?${params}`)
    return response.data
  },

  approveWorklog: async (approval: WorklogApproval) => {
    const response = await api.post('/api/worklogs/approve', approval)
    return response.data
  },

  getAssignedIssues: async (): Promise<JiraIssue[]> => {
    const response = await api.get('/api/worklogs/issues')
    return response.data
  },

  getRecentWorklogs: async (days: number = 7) => {
    const response = await api.get(`/api/worklogs/recent?days=${days}`)
    return response.data
  }
}

// Calendar API
export const calendarAPI = {
  getEvents: async (startDate?: string, endDate?: string): Promise<CalendarEvent[]> => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    
    const response = await api.get(`/api/calendar/events?${params}`)
    return response.data
  },

  getTodayEvents: async (): Promise<CalendarEvent[]> => {
    const response = await api.get('/api/calendar/today')
    return response.data
  },

  getWorkEvents: async (startDate?: string, endDate?: string): Promise<CalendarEvent[]> => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    
    const response = await api.get(`/api/calendar/work-events?${params}`)
    return response.data
  },

  refreshCalendar: async () => {
    const response = await api.post('/api/calendar/refresh')
    return response.data
  },

  getStatus: async () => {
    const response = await api.get('/api/calendar/status')
    return response.data
  }
}

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health')
    return response.data
  }
}

export default api