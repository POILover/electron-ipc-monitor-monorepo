import { contextBridge, ipcRenderer } from 'electron'
// Custom APIs for renderer
const monitorApi = {
  getMonitorData: () => {
    return new Promise(resolve => {
      ipcRenderer.on('monitor-data', (_, data) => {
        resolve(data)
      })
    })
  },
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('monitorApi', monitorApi)
    console.log('A???')
  } catch (error) {
    console.error(error)
  }
} else {
  console.log('B???')
  // @ts-ignore (define in dts)
  window.monitorApi = monitorApi
}
