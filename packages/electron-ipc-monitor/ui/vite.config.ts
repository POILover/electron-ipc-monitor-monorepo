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
        const esmPath = path.resolve(__dirname, '../dist_npm/esm/ui');
        const cjsPath = path.resolve(__dirname, '../dist_npm/cjs/ui');
        fs.copySync(distPath, esmPath);
        fs.copySync(distPath, cjsPath);
      }
    }
  ],
  server: {
    port: 5172,
    strictPort: true
  }
})
