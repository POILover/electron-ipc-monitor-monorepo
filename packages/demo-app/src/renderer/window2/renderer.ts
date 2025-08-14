import { randomIpcChannels } from "../../shared"

function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    const ipcHandlerBtn = document.getElementById('click-me')
    ipcHandlerBtn?.addEventListener('click', () => {
      const randomIpcChannelLength = randomIpcChannels.length
      const randomIndex = Math.floor(Math.random() * randomIpcChannelLength)
      const channel = randomIpcChannels[randomIndex]
      window.api[channel]()
    })
  })
}

init()
