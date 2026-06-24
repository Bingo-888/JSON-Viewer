import { useState } from 'react';
import type { JsonNodeType, JsonValue, TreeNode } from '@json-viewer/shared';
import { parseEditedValue } from '../../lib/treeOps';
import styles from './TreeView.module.css';

const BADGE_CLASS: Record<JsonNodeType, string> = {
  string: styles.badgeString,
  number: styles.badgeNumber,
  boolean: styles.badgeBoolean,
  null: styles.badgeNull,
  object: styles.badgeObject,
  array: styles.badgeArray,
};

function formatValue(type: JsonNodeType, value: unknown): string {
  if (type === 'string') return `"${String(value)}"`;
  if (type === 'null') return 'null';
  return String(value);
}

interface TreeNodeItemProps {
  node: TreeNode;
  depth?: number;
  onEdit: (id: string, value: JsonValue) => void;
  onDelete: (id: string) => void;
  onAddChild: (id: string) => void;
}

export function TreeNodeItem({ node, depth = 0, onEdit, onDelete, onAddChild }: TreeNodeItemProps) {
  const [expanded, setExpanded] = useState(node.expanded ?? false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const isBranch = node.type === 'object' || node.type === 'array';
  const childCount = node.children?.length ?? 0;

  const handleDoubleClick = () => {
    if (isBranch) return;
    setEditValue(node.type === 'string' ? String(node.value) : String(node.value));
    setEditing(true);
  };

  const handleEditBlur = () => {
    setEditing(false);
    const newValue = parseEditedValue(node.type, editValue);
    onEdit(node.id, newValue);
  };

  return (
    <div className={styles.node}>
      <div className={styles.nodeRow} style={{ paddingLeft: `${depth * 4 + 8}px` }}>
        {isBranch ? (
          <span className={styles.toggle} onClick={() => setExpanded(!expanded)}>
            {expanded ? '▼' : '▶'}
          </span>
        ) : (
          <span className={styles.togglePlaceholder} />
        )}

        {node.key !== null && <span className={styles.key}>{node.key}</span>}
        {node.key !== null && <span className={styles.bracket}>:</span>}

        <span className={BADGE_CLASS[node.type]}>{node.type}</span>

        {isBranch ? (
          <span className={styles.bracket}>
            {node.type === 'object' ? `{${childCount}}` : `[${childCount}]`}
          </span>
        ) : editing ? (
          <input
            className={styles.inlineInput}
            value={editValue}
            autoFocus
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleEditBlur()}
          />
        ) : (
          <span
            className={node.type === 'null' ? styles.valueNull : styles.value}
            onDoubleClick={handleDoubleClick}
          >
            {formatValue(node.type, node.value)}
          </span>
        )}

        <span className={styles.actions}>
          {isBranch && (
            <button
              type="button"
              className={styles.actionBtn}
              title="添加子节点"
              onClick={() => onAddChild(node.id)}
            >
              +
            </button>
          )}
          <button
            type="button"
            className={styles.actionBtn}
            title="删除节点"
            onClick={() => onDelete(node.id)}
          >
            ×
          </button>
        </span>
      </div>

      {isBranch && expanded && node.children && (
        <div className={styles.children}>
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
