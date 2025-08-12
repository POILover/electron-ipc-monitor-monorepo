import { app, globalShortcut, ipcMain, BrowserWindow, IpcMainInvokeEvent } from 'electron'
import { performance as perfHooksPerformance } from 'perf_hooks';
import path from 'path'
const polyfill_perf = polyfillPerformance();
const MonitorBrowserWindowTitle = 'MONITOR'
const shortcut = 'CmdOrCtrl+Shift+M'
const generateBrowserWindowTitle = (parentWindowId: number) => {
  return `${MonitorBrowserWindowTitle}_${parentWindowId}`
}
const resolveBrowserWindowTitle = (id: string) => {
  const [title, parentWindowId] = id.split('_')
  return { title, parentWindowId: Number(parentWindowId) }
}
export default class IpcMonitor {
  private static instance: IpcMonitor;
  private initialId = 0
  private monitorWindowMap = new Map<number, BrowserWindow>()
  private originalHandle = ipcMain.handle.bind(ipcMain)

  constructor() {
    this.setupWindowLifecycle()
  }

  private setupWindowLifecycle() {
    app.on('browser-window-created', (_, win) => {
      const id = win.id
      const resolvedTitle = resolveBrowserWindowTitle(win.title)
      if (resolvedTitle.title === MonitorBrowserWindowTitle) {
        // 说明打开的是监控窗口, id是monitor window的id
        this.monitorWindowMap.set(resolvedTitle.parentWindowId, win)
        win.on('closed', () => {
          this.monitorWindowMap.delete(resolvedTitle.parentWindowId)
        })
        return
      } else {
        // 说明是业务窗口, id是monitor window的父窗口id
        win.on('focus', () => {
          globalShortcut.register(shortcut, () => {
            this.openMonitorWindow(id)
          })
        })

        win.on('blur', () => globalShortcut.unregister(shortcut))
        win.on('closed', () => {
          globalShortcut.unregister(shortcut)
        })
      }
    })
  }
  private getId() {
    return Date.now().toString() + '-' + this.initialId++
  }
  private openMonitorWindow(parentWindowId: number) {
    createMonitorWindow(parentWindowId)
  }
  public wrapIpc() {
    const self = this
    return function (
      channel: string,
      listener: (event: IpcMainInvokeEvent, ...args: any[]) => any
    ) {
      const wrappedListener = async (event: IpcMainInvokeEvent, ...args: any[]) => {
        const parentWindowId = event.sender.id
        const wc = self.monitorWindowMap.get(parentWindowId)?.webContents
        let result: any
        if (wc) {
          const id = self.getId();
          wc.send('monitor:data', { id, channel, status: 'pending', args, perf: polyfill_perf.now() })
          try {
            result = await listener(event, ...args)
            wc.send('monitor:data', { id, channel, status: 'fullfilled', args, perf: polyfill_perf.now(), result })
          } catch (error) {
            wc.send('monitor:data', { id, channel, status: 'rejected', args, perf: polyfill_perf.now() })
          }
        } else {
          result = await listener(event, ...args)
        }
        return result
      }

      self.originalHandle(channel, wrappedListener)
    }
  }
  static getInstance(): IpcMonitor {
    if (!IpcMonitor.instance) {
      IpcMonitor.instance = new IpcMonitor();
    }
    return IpcMonitor.instance;
  }
}
export const ipcMonitor = IpcMonitor.getInstance()
export const ipcMonitorHandle = ipcMonitor.wrapIpc()

function createMonitorWindow(targetWindowId: number) {
  const monitorWindow = new BrowserWindow({
    title: generateBrowserWindowTitle(targetWindowId),
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  // 打开devtool
  // monitorWindow.webContents.openDevTools()

  if (process.env.MONITOR_UI_DEV_URL) {
    console.log(`Loading monitor UI from: ${process.env.MONITOR_UI_DEV_URL}`)
    monitorWindow.loadURL(`${process.env.MONITOR_UI_DEV_URL}`)
  } else {
    const moduleRoot = path.dirname(require.resolve('electron-ipc-monitor'))
    const uiDistPath = path.resolve(moduleRoot, 'ui/index.html')
    monitorWindow.loadFile(uiDistPath).catch((err) => {
      // fallback: 兼容开发环境或路径不对时的报错
      console.error('Failed to load monitor UI:', err)
    })
  }
}

function polyfillPerformance() {
  if (typeof globalThis.performance !== 'undefined') {
    return globalThis.performance;
  }
  return perfHooksPerformance;
}