
**中文 | [English](./README.en.md)**

# electron-ipc-monitor 核心模块

本包为 Electron IPC 通信监控的核心，包含主进程拦截与 UI 可视化两部分。

## main

- 拦截 `ipcMain.handle` 方法，采集主进程与渲染进程间的通信数据
- 将采集到的数据通过自定义通道暴露给 UI 模块

## ui

- 可视化展示通信数据，便于调试和分析
- 推荐配合 `ui` 子包使用

## npm 产物的打包逻辑

```bash
rimraf(dist_npm)
rimraf(dist_main)

tsc(main) -> dist_main
babel(dist_main) -> dist_npm/esm + dist_npm/cjs

build(ui) -> ui/dist
copySync(ui/dist) -> dist_npm/esm/ui
copySync(ui/dist) -> dist_npm/cjs/ui
```