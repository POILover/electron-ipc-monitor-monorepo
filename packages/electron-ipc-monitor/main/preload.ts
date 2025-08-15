import { contextBridge, ipcRenderer } from 'electron'
// Custom APIs for renderer
const monitorApi = {
  getMonitorData: () => ipcRenderer.invoke('monitor:data')
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
