export interface ElectronAPI {
  getAppVersion: () => Promise<string>
  minimizeToTray: () => Promise<void>
  showNotification: (title: string, body: string) => Promise<void>
  onFetchSuggestions: (callback: () => void) => () => void
  onOpenSettings: (callback: () => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}