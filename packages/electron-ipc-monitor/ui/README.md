
**中文 | [English](./README.en.md)**

# electron-ipc-monitor:ui

electron-ipc-monitor 的前端界面，基于 Vue 3 + Vite。

## 主要功能

- 实时展示 Electron 主进程与渲染进程间的 IPC 通信日志
- 支持查看每条消息的 channel、状态、耗时、数据大小、时间等
- 点击 channel 列可在右侧弹出界面查看 payload 和 response 的详细 JSON 数据

## 安装依赖

在 monorepo 项目根目录执行：

```bash
pnpm install
```

## 启动开发环境

在 monorepo 项目根目录执行：

```bash
pnpm --filter electron-ipc-monitor dev:ui
```

## 构建生产包

在 monorepo 项目根目录执行：

```bash
pnpm --filter electron-ipc-monitor build:ui
```

> 输出目录为 `../dist/ui`
