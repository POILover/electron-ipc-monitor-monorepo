**[中文](./README.md) | English**

# electron-ipc-monitor Core Module

This package is the core of Electron IPC monitoring, including both main process interception and UI visualization.

## main

- Intercepts the `ipcMain.handle` method to collect communication data between the main and renderer processes
- Exposes the collected data to the UI module via a custom channel

## ui

- Visualizes communication data for easier debugging and analysis
- Recommended to use with the `ui` subpackage

## npm Build Logic

```bash
rimraf(dist_npm)
rimraf(dist_main)

tsc(main) -> dist_main
babel(dist_main) -> dist_npm/esm + dist_npm/cjs

build(ui) -> ui/dist
copySync(ui/dist) -> dist_npm/esm/ui
copySync(ui/dist) -> dist_npm/cjs/ui
```
