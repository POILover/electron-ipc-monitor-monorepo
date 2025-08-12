import { ipcMonitorHandle } from "electron-ipc-monitor";
import { randomIpcChannels } from "../../shared";
import { randomPromise } from "./random-promise";
export function generateRandomIpc() {
  console.log(randomIpcChannels)
  randomIpcChannels.forEach(channel => {
    ipcMonitorHandle(channel, async () => {
      return await randomPromise()
    })
  })
}