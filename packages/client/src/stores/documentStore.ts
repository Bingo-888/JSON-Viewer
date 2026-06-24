import { create } from 'zustand';
import { parseJsonc, type SourceFormat } from '@json-viewer/shared';

const INITIAL_RAW_TEXT = '{\n  "hello": "world"\n}';

function parseInitialObject(): unknown | null {
  const result = parseJsonc(INITIAL_RAW_TEXT);
  return result.ok ? result.data : null;
}

interface DocumentState {
  rawText: string;
  parsedObject: unknown | null;
  filePath: string | null;
  sourceFormat: SourceFormat;
  isDirty: boolean;
  parseError: string | null;
  setRawText: (text: string) => void;
  setParsedObject: (obj: unknown | null) => void;
  setFilePath: (path: string | null) => void;
  setSourceFormat: (format: SourceFormat) => void;
  setParseError: (error: string | null) => void;
  markDirty: () => void;
  reset: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  rawText: INITIAL_RAW_TEXT,
  parsedObject: parseInitialObject(),
  filePath: null,
  sourceFormat: 'json',
  isDirty: false,
  parseError: null,

  setRawText: (text) => set({ rawText: text }),
  setParsedObject: (obj) => set({ parsedObject: obj }),
  setFilePath: (path) => set({ filePath: path }),
  setSourceFormat: (format) => set({ sourceFormat: format }),
  setParseError: (error) => set({ parseError: error }),
  markDirty: () => set({ isDirty: true }),
  reset: () =>
    set({
      rawText: INITIAL_RAW_TEXT,
      parsedObject: parseInitialObject(),
      filePath: null,
      sourceFormat: 'json',
      isDirty: false,
      parseError: null,
    }),
}));
