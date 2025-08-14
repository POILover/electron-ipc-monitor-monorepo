import { ipcMain } from "electron";
import { randomIpcChannels } from "../../shared";
import { randomPromise } from "./random-promise";
export function generateRandomIpc() {
  randomIpcChannels.forEach(channel => {
    ipcMain.handle(channel, async () => {
      return await randomPromise()
    })
  })
}