import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import path from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          window1: path.resolve(__dirname, 'src/renderer/window1.html'),
          window2: path.resolve(__dirname, 'src/renderer/window2.html')
        }
      }
    },
  }
})
