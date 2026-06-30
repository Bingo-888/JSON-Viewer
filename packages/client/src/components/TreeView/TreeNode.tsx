import { useEffect, useRef, useState } from 'react';
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

const CHILD_TYPES: JsonNodeType[] = ['string', 'number', 'boolean', 'null', 'object', 'array'];

const CHILD_TYPE_LABELS: Record<JsonNodeType, string> = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  null: 'null',
  object: 'object {}',
  array: 'array []',
};

function formatValue(type: JsonNodeType, value: unknown): string {
  if (type === 'string') return `"${String(value)}"`;
  if (type === 'null') return 'null';
  return String(value);
}

interface TreeNodeItemProps {
  node: TreeNode;
  depth?: number;
  arrayIndex?: number;
  onEdit: (id: string, value: JsonValue) => void;
  onDelete: (id: string) => void;
  onAddChild: (id: string, childType: JsonNodeType) => void;
  onToggleExpand: (id: string) => void;
  onRenameKey: (id: string, newKey: string) => string | null;
}

export function TreeNodeItem({
  node,
  depth = 0,
  arrayIndex,
  onEdit,
  onDelete,
  onAddChild,
  onToggleExpand,
  onRenameKey,
}: TreeNodeItemProps) {
  const [editingValue, setEditingValue] = useState(false);
  const [editingKey, setEditingKey] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editKey, setEditKey] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const isBranch = node.type === 'object' || node.type === 'array';
  const expanded = node.expanded ?? false;
  const childCount = node.children?.length ?? 0;
  const showObjectKey = node.key !== null;
  const showArrayIndex = arrayIndex !== undefined;

  useEffect(() => {
    if (!addMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [addMenuOpen]);

  const startValueEdit = () => {
    if (isBranch) return;
    setEditError(null);
    setEditValue(node.type === 'string' ? String(node.value) : String(node.value));
    setEditingValue(true);
  };

  const cancelValueEdit = () => {
    setEditingValue(false);
    setEditError(null);
  };

  const commitValueEdit = () => {
    if (node.type === 'boolean') {
      onEdit(node.id, editValue === 'true');
      setEditingValue(false);
      setEditError(null);
      return;
    }
    const result = parseEditedValue(node.type, editValue);
    if (!result.ok) {
      setEditError(result.error);
      return;
    }
    onEdit(node.id, result.value);
    setEditingValue(false);
    setEditError(null);
  };

  const startKeyEdit = () => {
    if (!showObjectKey) return;
    setEditError(null);
    setEditKey(node.key ?? '');
    setEditingKey(true);
  };

  const cancelKeyEdit = () => {
    setEditingKey(false);
    setEditError(null);
  };

  const commitKeyEdit = () => {
    const error = onRenameKey(node.id, editKey);
    if (error) {
      setEditError(error);
      return;
    }
    setEditingKey(false);
    setEditError(null);
  };

  const handleValueKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitValueEdit();
    } else if (e.key === 'Escape') {
      cancelValueEdit();
    }
  };

  const handleKeyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitKeyEdit();
    } else if (e.key === 'Escape') {
      cancelKeyEdit();
    }
  };

  return (
    <div className={styles.node}>
      <div className={styles.nodeRow} style={{ paddingLeft: `${depth * 4 + 8}px` }}>
        {isBranch ? (
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={expanded}
            aria-label={expanded ? '折叠' : '展开'}
            onClick={() => onToggleExpand(node.id)}
          >
            {expanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className={styles.togglePlaceholder} />
        )}

        {showArrayIndex && <span className={styles.arrayIndex}>[{arrayIndex}]</span>}

        {showObjectKey &&
          (editingKey ? (
            <input
              className={styles.inlineInput}
              value={editKey}
              autoFocus
              onChange={(e) => setEditKey(e.target.value)}
              onBlur={commitKeyEdit}
              onKeyDown={handleKeyKeyDown}
            />
          ) : (
            <span className={styles.key} onDoubleClick={startKeyEdit} title="双击编辑键名">
              {node.key}
            </span>
          ))}

        {(showObjectKey || showArrayIndex) && <span className={styles.bracket}>:</span>}

        <span className={BADGE_CLASS[node.type]}>{node.type}</span>

        {isBranch ? (
          <span className={styles.bracket}>
            {node.type === 'object' ? `{${childCount}}` : `[${childCount}]`}
          </span>
        ) : editingValue ? (
          <span className={styles.editWrapper}>
            {node.type === 'boolean' ? (
              <select
                className={styles.inlineSelect}
                value={editValue}
                autoFocus
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitValueEdit}
                onKeyDown={handleValueKeyDown}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : (
              <input
                className={styles.inlineInput}
                value={editValue}
                autoFocus
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitValueEdit}
                onKeyDown={handleValueKeyDown}
              />
            )}
          </span>
        ) : (
          <span
            className={node.type === 'null' ? styles.valueNull : styles.value}
            onDoubleClick={startValueEdit}
            title="双击编辑值"
          >
            {formatValue(node.type, node.value)}
          </span>
        )}

        {editError && <span className={styles.editError}>{editError}</span>}

        <span className={styles.actions}>
          {isBranch && (
            <div className={styles.addMenuWrapper} ref={addMenuRef}>
              <button
                type="button"
                className={styles.actionBtn}
                title="添加子节点"
                aria-expanded={addMenuOpen}
                onClick={() => setAddMenuOpen((open) => !open)}
              >
                +
              </button>
              {addMenuOpen && (
                <div className={styles.addMenu} role="menu">
                  {CHILD_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      role="menuitem"
                      className={styles.addMenuItem}
                      onClick={() => {
                        onAddChild(node.id, type);
                        setAddMenuOpen(false);
                      }}
                    >
                      {CHILD_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
          {node.children.map((child, index) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              arrayIndex={node.type === 'array' ? index : undefined}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onToggleExpand={onToggleExpand}
              onRenameKey={onRenameKey}
            />
          ))}
        </div>
      )}
    </div>
  );
}
