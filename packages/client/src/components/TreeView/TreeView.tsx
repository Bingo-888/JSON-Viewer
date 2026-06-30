import { useDocumentStore } from '../../stores/documentStore';
import { useSync } from '../../hooks/useSync';
import {
  addChildNodeOfType,
  deleteNode,
  renameNodeKey,
  toggleNodeExpanded,
  updateNodeValue,
} from '../../lib/treeOps';
import type { JsonNodeType, JsonValue } from '@json-viewer/shared';
import { TreeNodeItem } from './TreeNode';
import styles from './TreeView.module.css';

export function TreeView() {
  const treeNodes = useDocumentStore((s) => s.treeNodes);
  const parsedObject = useDocumentStore((s) => s.parsedObject);
  const parseError = useDocumentStore((s) => s.parseError);
  const isDirty = useDocumentStore((s) => s.isDirty);
  const setTreeNodes = useDocumentStore((s) => s.setTreeNodes);
  const { applyTreeNodes } = useSync();

  if (parsedObject === null) {
    return <div className={styles.empty}>JSON 解析失败</div>;
  }

  if (treeNodes.length === 0) {
    return <div className={styles.empty}>无数据</div>;
  }

  const handleEdit = (id: string, value: JsonValue) => {
    applyTreeNodes(updateNodeValue(treeNodes, id, value));
  };

  const handleDelete = (id: string) => {
    applyTreeNodes(deleteNode(treeNodes, id));
  };

  const handleAddChild = (id: string, childType: JsonNodeType) => {
    applyTreeNodes(addChildNodeOfType(treeNodes, id, childType));
  };

  const handleToggleExpand = (id: string) => {
    setTreeNodes(toggleNodeExpanded(treeNodes, id));
  };

  const handleRenameKey = (id: string, newKey: string): string | null => {
    const result = renameNodeKey(treeNodes, id, newKey);
    if (result.ok) {
      applyTreeNodes(result.nodes);
      return null;
    }
    return result.error;
  };

  const showStaleBanner = parseError !== null && isDirty;

  return (
    <div className={styles.treeContainer}>
      {showStaleBanner && (
        <div className={styles.staleBanner} role="status">
          代码存在语法错误，树显示的是上次有效内容
        </div>
      )}
      <div className={styles.tree}>
        {treeNodes.map((node) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
            onToggleExpand={handleToggleExpand}
            onRenameKey={handleRenameKey}
          />
        ))}
      </div>
    </div>
  );
}
