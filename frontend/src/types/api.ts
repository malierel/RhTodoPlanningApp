export interface WorklogSuggestion {
  id: string
  jira_key: string
  summary: string
  description: string
  time_spent: string // ISO 8601 duration
  start_time: string // ISO 8601 datetime
  confidence: number
  activity_data: Record<string, any>
}

export interface WorklogApproval {
  suggestion_id: string
  approved: boolean
  time_spent?: string
  description?: string
  start_time?: string
}

export interface JiraIssue {
  key: string
  summary: string
  description?: string
  status: string
  assignee?: string
  project: string
}

export interface CalendarEvent {
  uid: string
  summary: string
  description?: string
  start: string // ISO 8601 datetime
  end: string // ISO 8601 datetime
  location?: string
  attendees: string[]
}

export interface ServiceStatus {
  service: string
  status: string
  last_check: string
  error_message?: string
}