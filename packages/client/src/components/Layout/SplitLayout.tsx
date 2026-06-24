import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import type { ReactNode } from 'react';
import styles from './SplitLayout.module.css';

const PANEL_SIZE_KEY = 'json-viewer-panel-size';

interface SplitLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export function SplitLayout({ left, right }: SplitLayoutProps) {
  const saved = localStorage.getItem(PANEL_SIZE_KEY);
  const defaultLayout = saved ? (JSON.parse(saved) as number[]) : [40, 60];

  return (
    <PanelGroup
      direction="horizontal"
      className={styles.splitLayout}
      onLayout={(sizes) => localStorage.setItem(PANEL_SIZE_KEY, JSON.stringify(sizes))}
    >
      <Panel defaultSize={defaultLayout[0]} minSize={20} className={styles.panel}>
        <div className={styles.panelHeader}>树状视图</div>
        <div className={styles.panelContent}>{left}</div>
      </Panel>
      <PanelResizeHandle className={styles.resizeHandle} />
      <Panel defaultSize={defaultLayout[1]} minSize={20} className={styles.panel}>
        <div className={styles.panelHeader}>代码编辑器</div>
        <div className={styles.panelContent}>{right}</div>
      </Panel>
    </PanelGroup>
  );
}
