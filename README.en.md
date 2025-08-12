**[中文](./README.md) | English**

# electron-ipc-monitor Monorepo

This project is for the development of the `electron-ipc-monitor` plugin, which is a monorepo project.

`electron-ipc-monitor` is an IPC monitoring and visualization tool for Electron project development. It intercepts and displays `ipcMain.handle` calls, similar to the Network tab in browser DevTools.

## Notice

Although the final `electron-ipc-monitor` product has low dependency version requirements, this project is for personal development use with relatively high dependency versions. Please use it at your discretion.

## Project Structure

```
.
├── packages/
│   ├── electron-ipc-monitor/   # Core library: main process interception & UI
│   │   ├── main/               # Main process interception logic
│   │   └── ui/                 # Frontend UI (Vue 3 + Vite)
│   └── demo-app/               # Example Electron app with monitoring integrated
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## Getting Started

Try to operate in the root directory as much as possible, otherwise there may be some foreseeable problems.

### 1. Install dependencies

At the project root:

```bash
pnpm install
```

### 2. Build monitor/main module

You need to re-execute this build command every time you modify the main.ts file and restart the project, similar to modifying the main process in an Electron project.

```bash
pnpm run build:main
```

### 3. Start monitor UI development server

```bash
pnpm run dev:monitor
```

### 4. Start demo app development server

```bash
pnpm run dev:demo
```

### 5. Generate npm artifacts

```bash
pnpm run build:npm
```

## Features

- Intercept and record all `ipcMain.handle` communications between Electron main and renderer processes
- Real-time visualization of IPC logs: channel, status, duration, data size, timestamp, etc.
- Inspect detailed payload and response for each message
- Useful for debugging and performance analysis in Electron apps

## Packages

- `electron-ipc-monitor`: Core library (main process interception & UI)
- `electron-ipc-monitor/ui`: Vue 3-based frontend UI
- `demo-app`: Example Electron app with monitoring integration

## TODO
- [ ] Add language switching
- [ ] Add custom shortcut keys
