import { contextBridge, ipcRenderer } from 'electron'
// Custom APIs for renderer
const monitorApi = {
  getMonitorData: (cb: any) => {
    ipcRenderer.on('monitor:data', (_, data) => {
      cb(data)
    })
  },
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('monitorApi', monitorApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.monitorApi = monitorApi
}
