**[中文](./README.md) | English**

# electron-ipc-monitor:ui

The frontend UI for electron-ipc-monitor, built with Vue 3 + Vite.

## Features

- Real-time display of IPC logs between Electron main and renderer processes
- View details for each message: channel, status, duration, data size, timestamp, etc.
- Click the channel column to open a side panel for detailed JSON of payload and response

## Install dependencies

At the root of the monorepo, run:

```bash
pnpm install
```

## Start development server

At the root of the monorepo, run:

```bash
pnpm --filter electron-ipc-monitor dev:ui
```

## Build for production

At the root of the monorepo, run:

```bash
pnpm --filter electron-ipc-monitor build:ui
```

> Output directory: `../dist/ui`
