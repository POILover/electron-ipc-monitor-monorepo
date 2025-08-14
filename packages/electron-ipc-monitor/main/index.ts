import { app, globalShortcut, ipcMain, BrowserWindow, IpcMainInvokeEvent } from 'electron'
import { performance as perfHooksPerformance } from 'perf_hooks';
import path from 'path'
const polyfill_perf = polyfillPerformance();
const DEFAULT_SHORTCUT = 'CmdOrCtrl+Shift+M'
class IpcMonitor {
  private static instance: IpcMonitor;
  private initialId = 0
  private monitorWindowMap = new Map<number, BrowserWindow>()
  private originalHandle = ipcMain.handle.bind(ipcMain)
  private shortcut = DEFAULT_SHORTCUT

  constructor({ shortcut = DEFAULT_SHORTCUT } = {}) {
    if (IpcMonitor.instance) {
      throw new Error("IpcMonitor instance already exists")
    }
    this.shortcut = shortcut
    this.setupWindowLifecycle()
    IpcMonitor.instance = this;
  }

  private setupWindowLifecycle() {
    app.on('browser-window-created', (_, win) => {
      const id = win.id
      win.on('focus', () => {
        const isMonitorWindow = [...this.monitorWindowMap.values()].includes(win)
        if (!isMonitorWindow) {
          globalShortcut.register(this.shortcut, () => {
            const hasMonitorWindow = this.monitorWindowMap.has(id) // it should define in here
            if (hasMonitorWindow) {
              const monitorWindow = this.monitorWindowMap.get(id)
              monitorWindow?.close()
            } else {
              const monitorWindow = createMonitorWindow()
              this.monitorWindowMap.set(id, monitorWindow)
              monitorWindow.on('closed', () => {
                this.monitorWindowMap.delete(id)
              })
            }
          })
        }
      })

      win.on('blur', () => {
        const isMonitorWindow = [...this.monitorWindowMap.values()].includes(win)
        if (!isMonitorWindow) {
          globalShortcut.unregister(this.shortcut)
        }
      })

      win.on('closed', () => {
        const isMonitorWindow = [...this.monitorWindowMap.values()].includes(win)
        if (!isMonitorWindow) {
          const monitorWindow = this.monitorWindowMap.get(id)
          monitorWindow?.close()
          globalShortcut.unregister(this.shortcut)
        }
      })

    })
  }

  private generateIpcId() {
    return Date.now().toString() + '-' + this.initialId++
  }

  public ipcMonitorHandle() {
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
          const id = self.generateIpcId();
          wc.send('monitor:data', { id, channel, status: 'pending', args, perf: polyfill_perf.now() })
          try {
            result = await listener(event, ...args)
            wc.send('monitor:data', { id, channel, status: 'fullfilled', args, perf: polyfill_perf.now(), result })
          } catch (error) {
            wc.send('monitor:data', { id, channel, status: 'rejected', args, perf: polyfill_perf.now(), result: error })
          }
        } else {
          result = await listener(event, ...args)
        }
        return result
      }

      self.originalHandle(channel, wrappedListener)
    }
  }
}

function createMonitorWindow() {
  const monitorWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (process.env.MONITOR_UI_DEV_URL) {
    console.log(`Loading monitor UI from: ${process.env.MONITOR_UI_DEV_URL}`)
    monitorWindow.loadURL(`${process.env.MONITOR_UI_DEV_URL}`)
  } else {
    const moduleRoot = path.dirname(require.resolve('electron-ipc-monitor'))
    const uiDistPath = path.resolve(moduleRoot, 'ui/index.html')
    monitorWindow.loadFile(uiDistPath).catch((err) => {
      console.error('Failed to load monitor UI:', err)
    })
  }
  return monitorWindow;
}

function polyfillPerformance() {
  if (typeof globalThis.performance !== 'undefined') {
    return globalThis.performance;
  }
  return perfHooksPerformance;
}

export default function useIpcMonitor(option?: any) {
  const ipcMonitor = new IpcMonitor(option);
  return ipcMonitor.ipcMonitorHandle();
}