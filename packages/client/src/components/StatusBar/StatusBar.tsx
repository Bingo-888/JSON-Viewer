import { useDocumentStore } from '../../stores/documentStore';
import styles from './StatusBar.module.css';

interface StatusBarProps {
  validateMessage?: string | null;
}

export function StatusBar({ validateMessage }: StatusBarProps) {
  const filePath = useDocumentStore((s) => s.filePath);
  const isDirty = useDocumentStore((s) => s.isDirty);
  const parseError = useDocumentStore((s) => s.parseError);
  const sourceFormat = useDocumentStore((s) => s.sourceFormat);

  const statusText = validateMessage ?? (parseError ? parseError : 'JSON 有效');
  const statusClass = parseError ? styles.error : validateMessage ? styles.info : styles.ok;

  return (
    <div className={styles.statusBar}>
      <span className={styles.item}>{filePath ?? '未命名'}</span>
      {isDirty && <span className={`${styles.item} ${styles.dirty}`}>已修改</span>}
      {sourceFormat === 'jsonc' && <span className={styles.item}>源自 JSONC</span>}
      <span className={styles.spacer} />
      <span className={`${styles.item} ${statusClass}`}>{statusText}</span>
    </div>
  );
}
