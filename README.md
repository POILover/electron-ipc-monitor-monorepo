**中文 | [English](./README.en.md)**

# electron-ipc-monitor Monorepo

该项目用于 `electron-ipc-monitor` 插件的开发，它是一个 monorepo 项目。

`electron-ipc-monitor` 是一个用于 Electron 项目开发时的 IPC 通信监控与可视化的工具，能够拦截并展示 `ipcMain.handle` 的调用情况，类似于浏览器 DevTools 的 Network 面板。

## 注意

虽然 `electron-ipc-monitor` 最终产物需求依赖版本很低，但该项目为个人开发使用，各个依赖版本偏高，请酌情食用。

## 项目结构

```
.
├── packages/
│   ├── electron-ipc-monitor/   # 核心库，包含主进程拦截与 UI 可视化
│   │   ├── main/               # 主进程拦截逻辑
│   │   └── ui/                 # 前端可视化界面（Vue 3 + Vite）
│   └── demo-app/               # 示例 Electron 应用，集成监控功能
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## 快速开始

尽量在根目录操作，否则可能有一些可预见的问题。

### 1. 安装依赖

在项目根目录执行：

```bash
pnpm install
```

### 2. 构建 monitor/main 模块

每次修改main.ts文件都要重新执行这个打包指令，并重启项目，类似electron项目的主进程修改
```bash
pnpm run build:main
```

### 3. 启动监控 UI 开发服务

```bash
pnpm run dev:monitor
```

### 4. 启动示例应用开发服务

```bash
pnpm run dev:demo
```

### 5. 生成npm产物

```bash
pnpm run build:npm
```

## 主要功能

- 拦截并记录 Electron 主进程与渲染进程间的所有 `ipcMain.handle` 通信
- 实时可视化通信日志，支持查看 channel、状态、耗时、数据大小、时间等
- 详细查看每条消息的 payload 和 response
- 适用于 Electron 应用的 IPC 调试与性能分析

## 相关子包

- `electron-ipc-monitor`：核心库，包含主进程拦截与 UI
- `electron-ipc-monitor/ui`：基于 Vue 3 的前端可视化界面
- `demo-app`：集成监控功能的 Electron 示例应用

## TODO

- [x] 多窗口demo
- [ ] 区分多窗口的title
- [ ] 添加语言切换
- [ ] UI添加设置 - 语言、清除
- [ ] 添加自定义配置 - 快捷键、默认语言
- [ ] load自定义monitor window