import { useEffect, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useDocumentStore } from '../../stores/documentStore';
import { useSync } from '../../hooks/useSync';
import styles from './CodeEditor.module.css';

export function CodeEditor() {
  const rawText = useDocumentStore((s) => s.rawText);
  const parseError = useDocumentStore((s) => s.parseError);
  const { handleCodeChange } = useSync();
  const mountRef = useRef<Parameters<OnMount> | null>(null);

  const handleMount: OnMount = (editor, monaco) => {
    mountRef.current = [editor, monaco];
  };

  useEffect(() => {
    const mounted = mountRef.current;
    if (!mounted) return;
    const [editor, monaco] = mounted;
    const model = editor.getModel();
    if (!model) return;

    if (parseError) {
      const position = model.getPositionAt(Math.min(rawText.length, 1));
      monaco.editor.setModelMarkers(model, 'json', [
        {
          severity: monaco.MarkerSeverity.Error,
          message: parseError,
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column + 1,
        },
      ]);
    } else {
      monaco.editor.setModelMarkers(model, 'json', []);
    }
  }, [parseError, rawText]);

  return (
    <Editor
      className={styles.editor}
      language="json"
      value={rawText}
      theme="vs"
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
      }}
      onMount={handleMount}
      onChange={(value) => handleCodeChange(value ?? '')}
    />
  );
}
