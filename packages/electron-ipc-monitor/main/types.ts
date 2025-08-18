export interface IpcMonitorData {
  id: string
  channel: string
  status: 'pending' | 'fulfilled' | 'rejected'
  args: any[]
  perf: number
  result?: any
  error?: any
}

export interface MonitorOptions {
  shortcut?: Electron.Accelerator
  language?: 'zh' | 'en'
}

export type MonitorOptionsResolved = Required<MonitorOptions>

export interface MonitorWindow {
  id: number
  parentWindowId: number
  title: string
}
