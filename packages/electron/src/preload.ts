import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type { MenuAction } from './types.js';

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile') as Promise<{ content: string; path: string } | null>,
  saveFile: (content: string, defaultPath?: string) =>
    ipcRenderer.invoke('dialog:saveFile', content, defaultPath) as Promise<string | null>,
  getPlatform: () => process.platform,
  onMenuAction: (callback: (action: MenuAction) => void) => {
    const listener = (_event: IpcRendererEvent, action: MenuAction) => callback(action);
    ipcRenderer.on('menu:action', listener);
    return () => ipcRenderer.removeListener('menu:action', listener);
  },
});
