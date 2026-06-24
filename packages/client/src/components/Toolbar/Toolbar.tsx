import styles from './Toolbar.module.css';

interface ToolbarProps {
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onFormat?: () => void;
  onValidate?: () => void;
}

export function Toolbar({ onNew, onOpen, onSave, onFormat, onValidate }: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <span className={styles.title}>JSON Viewer</span>
      <button type="button" className={styles.button} onClick={onNew}>
        新建
      </button>
      <button type="button" className={styles.button} onClick={onOpen}>
        打开
      </button>
      <button type="button" className={styles.button} onClick={onSave}>
        保存
      </button>
      <span className={styles.separator} />
      <button type="button" className={styles.button} onClick={onFormat}>
        格式化
      </button>
      <button type="button" className={styles.button} onClick={onValidate}>
        校验
      </button>
    </div>
  );
}
