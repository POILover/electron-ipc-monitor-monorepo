export interface IpcMonitorData {
  id: string
  channel: string
  status: 'pending' | 'fulfilled' | 'rejected'
  args: any[]
  perf: number
  result?: any
  error?: any
}

export interface IpcMonitorOptions {
  shortcut?: string
  windowTitle?: string
  devMode?: boolean
}

export interface MonitorWindow {
  id: number
  parentWindowId: number
  title: string
}
