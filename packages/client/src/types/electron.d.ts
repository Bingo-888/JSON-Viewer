type MenuAction = 'new' | 'open' | 'save';

export interface ElectronAPI {
  openFile: () => Promise<{ content: string; path: string } | null>;
  saveFile: (content: string, defaultPath?: string) => Promise<string | null>;
  getPlatform: () => string;
  onMenuAction: (callback: (action: MenuAction) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
