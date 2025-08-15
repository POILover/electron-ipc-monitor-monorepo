import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs-extra'

// https://vite.dev/config/
export default defineConfig({
  base: './', // avoid file protocol issues
  plugins: [
    vue(),
    {
      name: 'copy-ui-to-cjs', // Custom plugin to copy built files
      closeBundle() {
        if (process.env.NPM_BUILD !== 'true') return;
        const distPath = path.resolve(__dirname, './dist');
        const uiPath = path.resolve(__dirname, '../dist_npm/ui');
        fs.copySync(distPath, uiPath);
      }
    }
  ],
  server: {
    port: 5172,
    strictPort: true
  }
})
