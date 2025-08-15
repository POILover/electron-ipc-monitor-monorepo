export interface IpcMonitorData {
  id: string
  channel: string
  status: 'pending' | 'fulfilled' | 'rejected'
  args: any[]
  perf: number
  result?: any
  error?: any
}

export interface MonitorOptionsResolved {
  shortcut: Electron.Accelerator
  language: string
}

export type MonitorOptions = Partial<MonitorOptionsResolved>

export interface MonitorWindow {
  id: number
  parentWindowId: number
  title: string
}
