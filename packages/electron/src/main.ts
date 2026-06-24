import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron';
import { buildMenu } from './menu.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
const DEFAULT_PORT = 3847;
const MAX_PORT_ATTEMPTS = 5;

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;
let serverPort = DEFAULT_PORT;

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once('error', () => resolve(false));
    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });
    tester.listen(port);
  });
}

async function findAvailablePort(startPort: number): Promise<number> {
  for (let i = 0; i < MAX_PORT_ATTEMPTS; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port in range ${startPort}-${startPort + MAX_PORT_ATTEMPTS - 1}`);
}

async function startProductionServer(): Promise<number> {
  serverPort = await findAvailablePort(DEFAULT_PORT);
  const serverEntry = path.resolve(__dirname, '../../server/dist/index.js');

  return new Promise((resolve, reject) => {
    serverProcess = spawn(process.execPath, [serverEntry], {
      env: { ...process.env, NODE_ENV: 'production', PORT: String(serverPort) },
      stdio: 'inherit',
    });

    serverProcess.on('error', reject);

    const checkHealth = async (attempts = 30) => {
      for (let i = 0; i < attempts; i++) {
        try {
          const res = await fetch(`http://localhost:${serverPort}/api/health`);
          if (res.ok) {
            resolve(serverPort);
            return;
          }
        } catch {
          // retry
        }
        await new Promise((r) => setTimeout(r, 200));
      }
      reject(new Error('Server failed to start'));
    };

    void checkHealth();
  });
}

function getPreloadPath(): string {
  return path.join(__dirname, 'preload.js');
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const menu = buildMenu(mainWindow);
  Menu.setApplicationMenu(menu);

  const url = isDev ? 'http://localhost:5173' : `http://localhost:${serverPort}`;
  await mainWindow.loadURL(url);

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    void shell.openExternal(targetUrl);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerIpcHandlers(): void {
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'JSON Files', extensions: ['json', 'jsonc'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    const content = await fs.readFile(filePath, 'utf-8');
    return { content, path: filePath };
  });

  ipcMain.handle('dialog:saveFile', async (_event, content: string, defaultPath?: string) => {
    const result = await dialog.showSaveDialog({
      defaultPath: defaultPath ?? 'untitled.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    await fs.writeFile(result.filePath, content, 'utf-8');
    return result.filePath;
  });
}

app.whenReady().then(async () => {
  registerIpcHandlers();

  if (!isDev) {
    await startProductionServer();
  }

  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
