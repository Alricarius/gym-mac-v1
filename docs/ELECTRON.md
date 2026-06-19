# Electron

## Arquitectura

```
┌─────────────────────────────────────────────────┐
│              Electron Application                │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │           Main Process (main.ts)             │  │
│  │                                               │  │
│  │  - Crea ventanas                              │  │
│  │  - Maneja IPC handlers                        │  │
│  │  - Auto-update                                │  │
│  │  - Notificaciones nativas                     │  │
│  │  - Menú de aplicación                         │  │
│  │  - Impresión de recibos                       │  │
│  └──────────────┬──────────────────────────────┘  │
│                 │ IPC (contextBridge)             │
│  ┌──────────────▼──────────────────────────────┐  │
│  │          Renderer Process (Angular)          │  │
│  │                                               │  │
│  │  - UI completa                                │  │
│  │  - Lógica de presentación                     │  │
│  │  - Estado de UI                               │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Preload script

El `preload.ts` expone APIs seguras al renderer mediante `contextBridge`. Nunca se expone `ipcRenderer` directamente.

```typescript
// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // App
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),

  // Notificaciones
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('notification:show', title, body),

  // Impresión
  printReceipt: (data: ReceiptData) =>
    ipcRenderer.invoke('print:receipt', data),

  // Ventana
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // Menú
  onMenuAction: (callback: (action: string) => void) => {
    const handler = (_event: any, action: string) => callback(action);
    ipcRenderer.on('menu:action', handler);
    return () => ipcRenderer.removeListener('menu:action', handler);
  },

  // Auto-update
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => {
    const handler = (_event: any, info: UpdateInfo) => callback(info);
    ipcRenderer.on('update:available', handler);
    return () => ipcRenderer.removeListener('update:available', handler);
  },
  onUpdateDownloaded: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('update:downloaded', handler);
    return () => ipcRenderer.removeListener('update:downloaded', handler);
  },
  installUpdate: () => ipcRenderer.invoke('update:install'),
});
```

## Main process

```typescript
// electron/main.ts
import { app, BrowserWindow, ipcMain, Menu, Notification, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1280, width),
    height: Math.min(800, height),
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  mainWindow.loadURL('http://localhost:4200');

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('app:get-version', () => app.getVersion());

ipcMain.handle('notification:show', (_event, title: string, body: string) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});

ipcMain.handle('print:receipt', async (_event, data: ReceiptData) => {
  const win = new BrowserWindow({ show: false });
  await win.loadURL(`data:text/html,${encodeURIComponent(generateReceiptHtml(data))}`);
  win.webContents.print({ printBackground: true });
  win.close();
});

// Auto-update
autoUpdater.on('update-available', (info) => {
  mainWindow?.webContents.send('update:available', info);
});

autoUpdater.on('download-progress', (progress) => {
  mainWindow?.webContents.send('update:progress', progress);
});

autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update:downloaded');
});

ipcMain.handle('update:install', () => {
  autoUpdater.quitAndInstall();
});

// Menú de aplicación
const menuTemplate: Electron.MenuItemConstructorOptions[] = [
  {
    label: 'Archivo',
    submenu: [
      {
        label: 'Nuevo Miembro',
        accelerator: 'CmdOrCtrl+N',
        click: () => mainWindow?.webContents.send('menu:action', 'new-member'),
      },
      {
        label: 'Check-in Rápido',
        accelerator: 'CmdOrCtrl+K',
        click: () => mainWindow?.webContents.send('menu:action', 'quick-checkin'),
      },
      { type: 'separator' },
      { role: 'quit' },
    ],
  },
  {
    label: 'Ver',
    submenu: [
      { role: 'reload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  },
  {
    label: 'Ayuda',
    submenu: [
      {
        label: 'Buscar actualizaciones',
        click: () => autoUpdater.checkForUpdates(),
      },
      { role: 'about' },
    ],
  },
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdates();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

## ElectronService (Angular)

```typescript
// core/services/electron.service.ts
import { Injectable, NgZone } from '@angular/core';

export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  showNotification: (title: string, body: string) => void;
  printReceipt: (data: ReceiptData) => Promise<void>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  onMenuAction: (callback: (action: string) => void) => () => void;
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void;
  onUpdateDownloaded: (callback: () => void) => () => void;
  installUpdate: () => Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class ElectronService {
  private readonly api: ElectronAPI | undefined = (window as any).electronAPI;

  constructor(private readonly ngZone: NgZone) {}

  get isElectron(): boolean {
    return !!this.api;
  }

  getAppVersion(): Promise<string> {
    return this.api?.getAppVersion() ?? Promise.resolve('0.0.0');
  }

  showNotification(title: string, body: string): void {
    this.api?.showNotification(title, body);
  }

  printReceipt(data: ReceiptData): Promise<void> {
    return this.api?.printReceipt(data) ?? Promise.resolve();
  }

  // Los callbacks de menú deben ejecutarse dentro de Angular zone
  onMenuAction(callback: (action: string) => void): () => void {
    return this.api?.onMenuAction((action) =>
      this.ngZone.run(() => callback(action))
    ) ?? (() => {});
  }
}
```

## Integración Angular + Electron

### angular.json

```json
{
  "projects": {
    "gym-desktop": {
      "architect": {
        "serve": {
          "options": {
            "port": 4200
          }
        },
        "build": {
          "options": {
            "outputPath": "dist/gym-desktop",
            "baseHref": "./"
          }
        }
      }
    }
  }
}
```

### package.json (scripts)

```json
{
  "scripts": {
    "start": "concurrently \"pnpm ng serve\" \"wait-on http://localhost:4200 && pnpm electron .\"",
    "build": "pnpm ng build && pnpm tsc -p electron/tsconfig.json",
    "package:mac": "pnpm build && electron-builder --mac",
    "package:win": "pnpm build && electron-builder --win",
    "package:linux": "pnpm build && electron-builder --linux"
  }
}
```

### electron-builder.yml

```yaml
appId: com.gym.management
productName: Gym Management
directories:
  output: release

files:
  - dist/**/*
  - electron/**/*.js
  - package.json

mac:
  category: public.app-category.healthcare-fitness
  target:
    - dmg
    - zip

win:
  target:
    - nsis

linux:
  target:
    - AppImage
    - deb

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true

publish:
  provider: github
  owner: your-org
  repo: gym-management
```

## Recetas comunes

### Impresión de recibos

```typescript
// En el renderer
async printReceipt(payment: Payment) {
  await this.electronService.printReceipt({
    gymName: this.settings.gymName,
    memberName: payment.memberName,
    planName: payment.planName,
    amount: payment.amount,
    date: payment.paidDate,
    receiptNumber: payment.reference,
  });
}
```

### Atajos de teclado globales

```typescript
// main.ts
import { globalShortcut } from 'electron';

app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+Shift+F', () => {
    mainWindow?.webContents.send('menu:action', 'quick-find');
  });
});
```

### Menú contextual

```typescript
// main.ts
ipcMain.on('show:context-menu', (_event, type: string) => {
  const template = getContextMenuTemplate(type);
  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window: mainWindow! });
});
```
