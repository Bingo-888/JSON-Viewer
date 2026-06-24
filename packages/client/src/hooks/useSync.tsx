import { createContext, useCallback, useContext, useRef, type MutableRefObject, type ReactNode } from 'react';
import { objectToTree, parseJsonc, stringifyJson, treeToObject, type JsonValue, type TreeNode } from '@json-viewer/shared';
import { useDocumentStore } from '../stores/documentStore';

export type SyncSource = 'none' | 'tree' | 'code';

interface SyncContextValue {
  syncingRef: MutableRefObject<SyncSource>;
  handleCodeChange: (text: string) => void;
  applyTreeNodes: (nodes: TreeNode[]) => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);

const DEBOUNCE_MS = 300;

export function SyncProvider({ children }: { children: ReactNode }) {
  const syncingRef = useRef<SyncSource>('none');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const setRawText = useDocumentStore((s) => s.setRawText);
  const setParsedObject = useDocumentStore((s) => s.setParsedObject);
  const setTreeNodes = useDocumentStore((s) => s.setTreeNodes);
  const setParseError = useDocumentStore((s) => s.setParseError);
  const markDirty = useDocumentStore((s) => s.markDirty);

  const handleCodeChange = useCallback(
    (text: string) => {
      if (syncingRef.current === 'tree') {
        syncingRef.current = 'none';
        return;
      }

      setRawText(text);
      markDirty();

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const result = parseJsonc(text);
        if (result.ok) {
          setParsedObject(result.data);
          setTreeNodes(objectToTree(result.data as JsonValue));
          setParseError(null);
        } else {
          setParseError(result.errors[0]?.message ?? 'JSON 解析失败');
        }
      }, DEBOUNCE_MS);
    },
    [setRawText, markDirty, setParsedObject, setTreeNodes, setParseError],
  );

  const applyTreeNodes = useCallback(
    (nodes: TreeNode[]) => {
      const obj = treeToObject(nodes);
      const text = stringifyJson(obj);
      syncingRef.current = 'tree';
      setTreeNodes(nodes);
      setParsedObject(obj);
      setRawText(text);
      setParseError(null);
      markDirty();
    },
    [setTreeNodes, setParsedObject, setRawText, setParseError, markDirty],
  );

  return (
    <SyncContext.Provider value={{ syncingRef, handleCodeChange, applyTreeNodes }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return ctx;
}
