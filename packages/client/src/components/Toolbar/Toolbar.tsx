import styles from './Toolbar.module.css';

interface ToolbarProps {
  onOpenFile?: () => void;
}

export function Toolbar({ onOpenFile }: ToolbarProps) {
  const handleNew = () => console.log('new');
  const handleOpen = () => {
    if (onOpenFile) {
      onOpenFile();
      return;
    }
    console.log('open');
  };
  const handleSave = () => console.log('save');
  const handleFormat = () => console.log('format');
  const handleValidate = () => console.log('validate');

  return (
    <div className={styles.toolbar}>
      <span className={styles.title}>JSON Viewer</span>
      <button type="button" className={styles.button} onClick={handleNew}>
        新建
      </button>
      <button type="button" className={styles.button} onClick={handleOpen}>
        打开
      </button>
      <button type="button" className={styles.button} onClick={handleSave}>
        保存
      </button>
      <span className={styles.separator} />
      <button type="button" className={styles.button} onClick={handleFormat}>
        格式化
      </button>
      <button type="button" className={styles.button} onClick={handleValidate}>
        校验
      </button>
    </div>
  );
}
