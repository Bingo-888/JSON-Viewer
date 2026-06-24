import { create } from 'zustand';
import { objectToTree, parseJsonc, type JsonValue, type SourceFormat, type TreeNode } from '@json-viewer/shared';

const INITIAL_RAW_TEXT = '{\n  "hello": "world"\n}';

function parseInitialObject(): unknown | null {
  const result = parseJsonc(INITIAL_RAW_TEXT);
  return result.ok ? result.data : null;
}

interface LoadDocumentPayload {
  rawText: string;
  parsedObject: unknown;
  filePath: string | null;
  sourceFormat: SourceFormat;
  treeNodes: TreeNode[];
}

interface DocumentState {
  rawText: string;
  parsedObject: unknown | null;
  treeNodes: TreeNode[];
  filePath: string | null;
  sourceFormat: SourceFormat;
  isDirty: boolean;
  parseError: string | null;
  setRawText: (text: string) => void;
  setParsedObject: (obj: unknown | null) => void;
  setTreeNodes: (nodes: TreeNode[]) => void;
  setFilePath: (path: string | null) => void;
  setSourceFormat: (format: SourceFormat) => void;
  setParseError: (error: string | null) => void;
  markDirty: () => void;
  markClean: () => void;
  loadDocument: (payload: LoadDocumentPayload) => void;
  reset: () => void;
}

const initialParsed = parseInitialObject();
const initialTreeNodes = initialParsed ? objectToTree(initialParsed as JsonValue) : [];

export const useDocumentStore = create<DocumentState>((set) => ({
  rawText: INITIAL_RAW_TEXT,
  parsedObject: initialParsed,
  treeNodes: initialTreeNodes,
  filePath: null,
  sourceFormat: 'json',
  isDirty: false,
  parseError: null,

  setRawText: (text) => set({ rawText: text }),
  setParsedObject: (obj) => set({ parsedObject: obj }),
  setTreeNodes: (nodes) => set({ treeNodes: nodes }),
  setFilePath: (path) => set({ filePath: path }),
  setSourceFormat: (format) => set({ sourceFormat: format }),
  setParseError: (error) => set({ parseError: error }),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
  loadDocument: (payload) =>
    set({
      rawText: payload.rawText,
      parsedObject: payload.parsedObject,
      treeNodes: payload.treeNodes,
      filePath: payload.filePath,
      sourceFormat: payload.sourceFormat,
      isDirty: false,
      parseError: null,
    }),
  reset: () => {
    const parsed = parseInitialObject();
    set({
      rawText: INITIAL_RAW_TEXT,
      parsedObject: parsed,
      treeNodes: parsed ? objectToTree(parsed as JsonValue) : [],
      filePath: null,
      sourceFormat: 'json',
      isDirty: false,
      parseError: null,
    });
  },
}));
