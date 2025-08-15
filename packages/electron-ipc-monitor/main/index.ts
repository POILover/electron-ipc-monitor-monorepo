import { app, globalShortcut, ipcMain, BrowserWindow, IpcMainInvokeEvent } from 'electron'
import { performance as perfHooksPerformance } from 'perf_hooks';
import path from 'path'
import { MonitorOptions, MonitorOptionsResolved } from './types';
const polyfill_perf = polyfillPerformance();
const DEFAULT_OPTIONS: MonitorOptionsResolved = {
  shortcut: 'CmdOrCtrl+Shift+M',
  language: 'zh'
}
class IpcMonitor {
  private static instance: IpcMonitor;
  private initialId = 0
  private monitorWindowMap = new Map<number, BrowserWindow>()
  private originalHandle = ipcMain.handle.bind(ipcMain)
  private options: MonitorOptionsResolved
  constructor(options?: MonitorOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    if (IpcMonitor.instance) {
      throw new Error("IpcMonitor instance already exists")
    }
    this.setupWindowLifecycle()
    IpcMonitor.instance = this;
  }

  private setupWindowLifecycle() {
    app.on('browser-window-created', (_, win) => {
      const id = win.id
      win.on('focus', () => {
        if (!this.isMonitorWindow(win)) {
          globalShortcut.register(this.options.shortcut, () => {
            if (this.hasMonitorWindow(win)) {
              const monitorWindow = this.monitorWindowMap.get(id)
              monitorWindow?.close()
            } else {
              const monitorWindow = this.createMonitorWindow(win)
              this.monitorWindowMap.set(id, monitorWindow)
              monitorWindow.on('closed', () => {
                this.monitorWindowMap.delete(id)
              })
            }
          })
        }
      })

      win.on('blur', () => {
        if (!this.isMonitorWindow(win)) {
          globalShortcut.unregister(this.options.shortcut)
        }
      })

      win.on('closed', () => {
        if (!this.isMonitorWindow(win)) {
          const monitorWindow = this.monitorWindowMap.get(id)
          monitorWindow?.close()
          globalShortcut.unregister(this.options.shortcut)
        }
      })

    })
  }
  private isMonitorWindow(window: BrowserWindow) {
    return [...this.monitorWindowMap.values()].includes(window);
  }
  private hasMonitorWindow(window: BrowserWindow) {
    return this.monitorWindowMap.has(window.id);
  }
  private createMonitorWindow(parentWindow: BrowserWindow) {
    const parentWindowTitle = parentWindow.getTitle()
    let monitorWindowTitle = parentWindowTitle ? `Monitor Window $ - ${parentWindowTitle}` : ``
    const monitorWindow = new BrowserWindow({
      title: monitorWindowTitle,
      width: 1200,
      height: 800,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })
    monitorWindowTitle = monitorWindowTitle.replace(`Monitor Window $`, `Monitor Window $${monitorWindow.id}`)
    monitorWindow.setTitle(monitorWindowTitle)
    const language = this.options.language
    const query = `?lang=${language}`
    if (process.env.MONITOR_UI_DEV_URL) {
      console.log(`Loading monitor UI from: ${process.env.MONITOR_UI_DEV_URL}`)
      monitorWindow.loadURL(`${process.env.MONITOR_UI_DEV_URL}${query}`)
    } else {
      /* 
        npm package directory structure
        ├── dist/
        │   ├── cjs/
        │   │   └── index.js
        │   ├── esm/
        │   │   └── index.js
        │   └── ui/
        │       └── index.html
        
        npm.package.exports
          {
            ".": {
              "require": "./dist/cjs/index.js",
              "import": "./dist/esm/index.js"
            }
          }
      */
      const moduleRoot = path.dirname(require.resolve('electron-ipc-monitor')) // module root is based on exports option of package.json
      const uiDistPath = path.resolve(moduleRoot, '../ui/index.html') // __dirname has undefined behavior in electron context
      monitorWindow.loadURL(`file://${uiDistPath}${query}`).catch((err) => {
        console.error('Failed to load monitor UI:', err)
      })
    }
    return monitorWindow;
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

function polyfillPerformance() {
  if (typeof globalThis.performance !== 'undefined') {
    return globalThis.performance;
  }
  return perfHooksPerformance;
}

export const useIpcMonitor = (option?: MonitorOptions) => {
  const ipcMonitor = new IpcMonitor(option);
  return ipcMonitor.ipcMonitorHandle();
}