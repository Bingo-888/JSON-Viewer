import { SplitLayout } from './components/Layout/SplitLayout';
import { TreeView } from './components/TreeView/TreeView';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { Toolbar } from './components/Toolbar/Toolbar';
import { StatusBar } from './components/StatusBar/StatusBar';
import styles from './App.module.css';

export function App() {
  return (
    <div className={styles.app}>
      <Toolbar />
      <div className={styles.main}>
        <SplitLayout left={<TreeView />} right={<CodeEditor />} />
      </div>
      <StatusBar />
    </div>
  );
}
