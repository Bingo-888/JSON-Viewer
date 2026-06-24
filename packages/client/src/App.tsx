import { useEffect } from 'react';
import { SplitLayout } from './components/Layout/SplitLayout';
import { TreeView } from './components/TreeView/TreeView';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { Toolbar } from './components/Toolbar/Toolbar';
import { StatusBar } from './components/StatusBar/StatusBar';
import { JsoncWarningModal } from './components/JsoncWarningModal/JsoncWarningModal';
import { SyncProvider } from './hooks/useSync';
import { useJsonDocument } from './hooks/useJsonDocument';
import styles from './App.module.css';

function AppContent() {
  const {
    newDocument,
    openDocument,
    saveDocument,
    formatDocument,
    validateDocument,
    jsoncModalOpen,
    confirmJsoncOpen,
    cancelJsoncOpen,
    validateMessage,
  } = useJsonDocument();

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    return api.onMenuAction((action) => {
      switch (action) {
        case 'new':
          newDocument();
          break;
        case 'open':
          void openDocument();
          break;
        case 'save':
          void saveDocument();
          break;
      }
    });
  }, [newDocument, openDocument, saveDocument]);

  return (
    <div className={styles.app}>
      <Toolbar
        onNew={newDocument}
        onOpen={openDocument}
        onSave={saveDocument}
        onFormat={formatDocument}
        onValidate={validateDocument}
      />
      <div className={styles.main}>
        <SplitLayout left={<TreeView />} right={<CodeEditor />} />
      </div>
      <StatusBar validateMessage={validateMessage} />
      <JsoncWarningModal
        open={jsoncModalOpen}
        onConfirm={confirmJsoncOpen}
        onCancel={cancelJsoncOpen}
      />
    </div>
  );
}

export function App() {
  return (
    <SyncProvider>
      <AppContent />
    </SyncProvider>
  );
}
