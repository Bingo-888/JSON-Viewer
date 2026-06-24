import { useCallback, useMemo, useState } from 'react';
import { isLikelyJsonc, objectToTree, parseJsonc, stringifyJson, type JsonValue } from '@json-viewer/shared';
import { useDocumentStore } from '../stores/documentStore';
import { createBrowserFileIO, type FileIO } from '../lib/fileIo';

const SKIP_JSONC_WARNING_KEY = 'json-viewer-skip-jsonc-warning';
const LARGE_FILE_BYTES = 5 * 1024 * 1024;

interface PendingFile {
  content: string;
  path: string;
}

export function useJsonDocument(fileIO?: FileIO) {
  const io = useMemo(() => fileIO ?? createBrowserFileIO(), [fileIO]);

  const [jsoncModalOpen, setJsoncModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [validateMessage, setValidateMessage] = useState<string | null>(null);

  const loadDocument = useDocumentStore((s) => s.loadDocument);
  const setParseError = useDocumentStore((s) => s.setParseError);
  const rawText = useDocumentStore((s) => s.rawText);
  const filePath = useDocumentStore((s) => s.filePath);
  const setFilePath = useDocumentStore((s) => s.setFilePath);
  const markClean = useDocumentStore((s) => s.markClean);

  const applyFile = useCallback(
    (file: PendingFile) => {
      const isJsonc = isLikelyJsonc(file.content, file.path);
      const result = parseJsonc(file.content);
      if (!result.ok) {
        setParseError(result.errors[0]?.message ?? 'JSON 解析失败');
        return;
      }
      const formatted = stringifyJson(result.data);
      loadDocument({
        rawText: formatted,
        parsedObject: result.data,
        filePath: file.path,
        sourceFormat: isJsonc ? 'jsonc' : 'json',
        treeNodes: objectToTree(result.data as JsonValue),
      });
      setValidateMessage(null);
    },
    [loadDocument, setParseError],
  );

  const openDocument = useCallback(async () => {
    const file = await io.open();
    if (!file) return;

    if (file.content.length > LARGE_FILE_BYTES) {
      const proceed = window.confirm('文件较大，可能影响性能，是否继续？');
      if (!proceed) return;
    }

    const isJsonc = isLikelyJsonc(file.content, file.path);
    const skipWarning = localStorage.getItem(SKIP_JSONC_WARNING_KEY) === 'true';

    if (isJsonc && !skipWarning) {
      setPendingFile(file);
      setJsoncModalOpen(true);
      return;
    }

    applyFile(file);
  }, [io, applyFile]);

  const confirmJsoncOpen = useCallback(
    (dontShowAgain: boolean) => {
      if (dontShowAgain) {
        localStorage.setItem(SKIP_JSONC_WARNING_KEY, 'true');
      }
      if (pendingFile) {
        applyFile(pendingFile);
      }
      setPendingFile(null);
      setJsoncModalOpen(false);
    },
    [pendingFile, applyFile],
  );

  const cancelJsoncOpen = useCallback(() => {
    setPendingFile(null);
    setJsoncModalOpen(false);
  }, []);

  const newDocument = useCallback(() => {
    const empty = {};
    const text = stringifyJson(empty);
    loadDocument({
      rawText: text,
      parsedObject: empty,
      filePath: null,
      sourceFormat: 'json',
      treeNodes: objectToTree(empty),
    });
    setValidateMessage(null);
  }, [loadDocument]);

  const saveDocument = useCallback(async () => {
    const result = parseJsonc(rawText);
    const content = result.ok ? stringifyJson(result.data) : rawText;
    const savedPath = await io.save(content, filePath);
    if (savedPath) {
      setFilePath(savedPath);
      markClean();
    }
  }, [io, rawText, filePath, setFilePath, markClean]);

  const formatDocument = useCallback(() => {
    const result = parseJsonc(rawText);
    if (!result.ok) {
      setParseError(result.errors[0]?.message ?? 'JSON 解析失败');
      setValidateMessage('格式化失败：JSON 无效');
      return;
    }
    const formatted = stringifyJson(result.data);
    loadDocument({
      rawText: formatted,
      parsedObject: result.data,
      filePath,
      sourceFormat: useDocumentStore.getState().sourceFormat,
      treeNodes: objectToTree(result.data as JsonValue),
    });
    setValidateMessage('格式化成功');
  }, [rawText, filePath, loadDocument, setParseError]);

  const validateDocument = useCallback(() => {
    const result = parseJsonc(rawText);
    if (result.ok) {
      setParseError(null);
      setValidateMessage('JSON 校验通过');
    } else {
      const message = result.errors[0]?.message ?? 'JSON 解析失败';
      setParseError(message);
      setValidateMessage(`校验失败：${message}`);
    }
  }, [rawText, setParseError]);

  return {
    newDocument,
    openDocument,
    saveDocument,
    formatDocument,
    validateDocument,
    jsoncModalOpen,
    confirmJsoncOpen,
    cancelJsoncOpen,
    validateMessage,
  };
}
