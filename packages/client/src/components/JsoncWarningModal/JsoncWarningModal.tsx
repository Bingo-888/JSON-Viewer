import { useState } from 'react';
import styles from './JsoncWarningModal.module.css';

interface JsoncWarningModalProps {
  open: boolean;
  onConfirm: (dontShowAgain: boolean) => void;
  onCancel: () => void;
}

export function JsoncWarningModal({ open, onConfirm, onCancel }: JsoncWarningModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>JSONC 文件警告</h2>
        <p className={styles.message}>
          此文件包含 JSONC 语法（注释等）。打开后将转换为标准 JSON 进行编辑，注释不会保留。是否继续？
        </p>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          不再提示
        </label>
        <div className={styles.actions}>
          <button type="button" className={styles.button} onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={() => onConfirm(dontShowAgain)}
          >
            继续打开
          </button>
        </div>
      </div>
    </div>
  );
}
