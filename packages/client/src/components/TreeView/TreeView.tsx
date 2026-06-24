import { objectToTree, type JsonValue } from '@json-viewer/shared';
import { useDocumentStore } from '../../stores/documentStore';
import { TreeNodeItem } from './TreeNode';
import styles from './TreeView.module.css';

export function TreeView() {
  const parsedObject = useDocumentStore((s) => s.parsedObject);

  if (parsedObject === null) {
    return <div className={styles.empty}>JSON 解析失败</div>;
  }

  const nodes = objectToTree(parsedObject as JsonValue);

  if (nodes.length === 0) {
    return <div className={styles.empty}>无数据</div>;
  }

  return (
    <div className={styles.tree}>
      {nodes.map((node) => (
        <TreeNodeItem key={node.id} node={node} />
      ))}
    </div>
  );
}
