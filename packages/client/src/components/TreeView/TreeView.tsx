import { useDocumentStore } from '../../stores/documentStore';
import { useSync } from '../../hooks/useSync';
import { addChildNode, deleteNode, updateNodeValue } from '../../lib/treeOps';
import type { JsonValue } from '@json-viewer/shared';
import { TreeNodeItem } from './TreeNode';
import styles from './TreeView.module.css';

export function TreeView() {
  const treeNodes = useDocumentStore((s) => s.treeNodes);
  const parsedObject = useDocumentStore((s) => s.parsedObject);
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

  const handleAddChild = (id: string) => {
    applyTreeNodes(addChildNode(treeNodes, id));
  };

  return (
    <div className={styles.tree}>
      {treeNodes.map((node) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddChild={handleAddChild}
        />
      ))}
    </div>
  );
}
