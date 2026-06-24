import { useDocumentStore } from '../../stores/documentStore';
import styles from './StatusBar.module.css';

export function StatusBar() {
  const filePath = useDocumentStore((s) => s.filePath);
  const isDirty = useDocumentStore((s) => s.isDirty);
  const parseError = useDocumentStore((s) => s.parseError);
  const sourceFormat = useDocumentStore((s) => s.sourceFormat);

  return (
    <div className={styles.statusBar}>
      <span className={styles.item}>{filePath ?? '未命名'}</span>
      {isDirty && <span className={`${styles.item} ${styles.dirty}`}>已修改</span>}
      {sourceFormat === 'jsonc' && <span className={styles.item}>源自 JSONC</span>}
      <span className={styles.spacer} />
      {parseError ? (
        <span className={`${styles.item} ${styles.error}`}>{parseError}</span>
      ) : (
        <span className={`${styles.item} ${styles.ok}`}>JSON 有效</span>
      )}
    </div>
  );
}
