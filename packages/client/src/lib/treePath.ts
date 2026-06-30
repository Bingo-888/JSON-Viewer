import type { JsonValue, TreeNode } from '@json-viewer/shared';
import { objectToTree } from '@json-viewer/shared';

/** 收集各 path 对应的展开状态 */
export function collectExpandedByPath(nodes: TreeNode[]): Map<string, boolean> {
  const map = new Map<string, boolean>();
  const walk = (list: TreeNode[]) => {
    for (const node of list) {
      if (node.path !== undefined) {
        map.set(node.path, node.expanded ?? false);
      }
      if (node.children) {
        walk(node.children);
      }
    }
  };
  walk(nodes);
  return map;
}

/** 将旧树的展开状态合并到新树（按 path 匹配） */
export function mergeExpandedByPath(nodes: TreeNode[], expandedMap: Map<string, boolean>): TreeNode[] {
  return nodes.map((node) => ({
    ...node,
    expanded: node.path !== undefined ? (expandedMap.get(node.path) ?? node.expanded) : node.expanded,
    children: node.children ? mergeExpandedByPath(node.children, expandedMap) : undefined,
  }));
}

export function findNodeByPath(nodes: TreeNode[], path: string): TreeNode | null {
  for (const node of nodes) {
    if (node.path === path) {
      return node;
    }
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function findNodeById(nodes: TreeNode[], id: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/** 从 JSON 值重建树并保留旧树的展开状态 */
export function rebuildTreePreservingExpanded(value: JsonValue, oldNodes: TreeNode[]): TreeNode[] {
  return mergeExpandedByPath(objectToTree(value), collectExpandedByPath(oldNodes));
}
