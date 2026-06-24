import Editor from '@monaco-editor/react';
import { useDocumentStore } from '../../stores/documentStore';
import styles from './CodeEditor.module.css';

export function CodeEditor() {
  const rawText = useDocumentStore((s) => s.rawText);
  const setRawText = useDocumentStore((s) => s.setRawText);
  const markDirty = useDocumentStore((s) => s.markDirty);

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
      onChange={(value) => {
        setRawText(value ?? '');
        markDirty();
      }}
    />
  );
}
