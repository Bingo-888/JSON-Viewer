export interface FileIO {
  open(): Promise<{ content: string; path: string } | null>;
  save(content: string, path?: string | null): Promise<string | null>;
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function createBrowserFileIO(): FileIO {
  return {
    open() {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.jsonc,application/json';
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) {
            resolve(null);
            return;
          }
          const content = await readFileAsText(file);
          resolve({ content, path: file.name });
        };
        input.click();
      });
    },

    save(content, path) {
      const fileName = path?.endsWith('.json')
        ? path
        : path
          ? `${path.replace(/\.jsonc$/, '')}.json`
          : 'untitled.json';
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      return Promise.resolve(fileName);
    },
  };
}

export function createElectronFileIO(): FileIO {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('electronAPI is not available');
  }

  return {
    open: () => api.openFile(),
    save: (content, path) => api.saveFile(content, path ?? undefined),
  };
}

export function getFileIO(): FileIO {
  if (typeof window.electronAPI !== 'undefined') {
    return createElectronFileIO();
  }
  return createBrowserFileIO();
}
