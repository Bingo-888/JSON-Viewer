import type { JsonNodeType, JsonValue, TreeNode } from '@json-viewer/shared';
import { generateNodeId } from '@json-viewer/shared';

export type ParseEditResult = { ok: true; value: JsonValue } | { ok: false; error: string };

function cloneNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((node) => ({
    ...node,
    children: node.children ? cloneNodes(node.children) : undefined,
  }));
}

function updateNodeInTree(nodes: TreeNode[], id: string, updater: (node: TreeNode) => TreeNode): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return updater(node);
    }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, id, updater) };
    }
    return node;
  });
}

function deleteNodeInTree(nodes: TreeNode[], id: string): TreeNode[] {
  const filtered = nodes.filter((node) => node.id !== id);
  if (filtered.length !== nodes.length) {
    return filtered;
  }
  return nodes.map((node) => {
    if (node.children) {
      return { ...node, children: deleteNodeInTree(node.children, id) };
    }
    return node;
  });
}

function findParentOf(nodes: TreeNode[], childId: string): TreeNode | null {
  for (const node of nodes) {
    if (node.children?.some((c) => c.id === childId)) {
      return node;
    }
    if (node.children) {
      const found = findParentOf(node.children, childId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function parseEditedValue(type: JsonNodeType, text: string): ParseEditResult {
  switch (type) {
    case 'string':
      return { ok: true, value: text };
    case 'number': {
      if (text.trim() === '') {
        return { ok: false, error: '数字不能为空' };
      }
      const num = Number(text);
      if (Number.isNaN(num)) {
        return { ok: false, error: '无效的数字' };
      }
      return { ok: true, value: num };
    }
    case 'boolean':
      if (text !== 'true' && text !== 'false') {
        return { ok: false, error: '请选择 true 或 false' };
      }
      return { ok: true, value: text === 'true' };
    case 'null':
      return { ok: true, value: null };
    default:
      return { ok: true, value: text };
  }
}

function getValueType(value: JsonValue): JsonNodeType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return typeof value as JsonNodeType;
}

export function defaultValueForType(type: JsonNodeType): JsonValue {
  switch (type) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'null':
      return null;
    case 'object':
      return {};
    case 'array':
      return [];
    default:
      return '';
  }
}

function createNode(key: string | null, value: JsonValue, parentPath: string, index?: number): TreeNode {
  const type = getValueType(value);
  const path =
    key !== null
      ? `${parentPath}.${key}`
      : index !== undefined
        ? `${parentPath}[${index}]`
        : parentPath;
  const isBranch = type === 'object' || type === 'array';
  return {
    id: generateNodeId(),
    key,
    value: isBranch ? value : value,
    type,
    path,
    expanded: isBranch,
    children: isBranch ? [] : undefined,
  };
}

function rebuildArrayPaths(children: TreeNode[], parentPath: string): TreeNode[] {
  return children.map((child, index) => ({
    ...child,
    path: `${parentPath}[${index}]`,
    children: child.children ? rebuildChildPaths(child, `${parentPath}[${index}]`) : undefined,
  }));
}

function rebuildChildPaths(node: TreeNode, parentPath: string): TreeNode[] {
  if (!node.children) {
    return [];
  }
  if (node.type === 'array') {
    return rebuildArrayPaths(node.children, parentPath);
  }
  return node.children.map((child) => {
    const childPath = child.key !== null ? `${parentPath}.${child.key}` : parentPath;
    return {
      ...child,
      path: childPath,
      children: child.children ? rebuildChildPaths(child, childPath) : undefined,
    };
  });
}

export function updateNodeValue(nodes: TreeNode[], id: string, value: JsonValue): TreeNode[] {
  return updateNodeInTree(nodes, id, (node) => {
    if (node.type === 'object' || node.type === 'array') {
      return node;
    }
    return { ...node, value, type: getValueType(value) };
  });
}

export function toggleNodeExpanded(nodes: TreeNode[], id: string): TreeNode[] {
  return updateNodeInTree(nodes, id, (node) => ({ ...node, expanded: !node.expanded }));
}

export type RenameKeyResult = { ok: true; nodes: TreeNode[] } | { ok: false; error: string };

export function renameNodeKey(nodes: TreeNode[], id: string, newKey: string): RenameKeyResult {
  const trimmed = newKey.trim();
  if (!trimmed) {
    return { ok: false, error: '键名不能为空' };
  }

  const parent = findParentOf(nodes, id);
  if (!parent || parent.type !== 'object') {
    return { ok: false, error: '只能重命名对象属性' };
  }

  const target = parent.children?.find((c) => c.id === id);
  if (!target || target.key === null) {
    return { ok: false, error: '节点不存在' };
  }

  if (parent.children?.some((c) => c.id !== id && c.key === trimmed)) {
    return { ok: false, error: `键名 "${trimmed}" 已存在` };
  }

  const parentPath = parent.path ?? '$';
  const newPath = `${parentPath}.${trimmed}`;

  const cloned = cloneNodes(nodes);
  const updated = updateNodeInTree(cloned, id, (node) => ({
    ...node,
    key: trimmed,
    path: newPath,
    children: node.children ? rebuildChildPaths({ ...node, path: newPath }, newPath) : undefined,
  }));

  return { ok: true, nodes: updated };
}

export function deleteNode(nodes: TreeNode[], id: string): TreeNode[] {
  const cloned = cloneNodes(nodes);
  const parent = findParentOf(cloned, id);
  const result = deleteNodeInTree(cloned, id);
  if (parent?.type === 'array' && parent.path) {
    return updateNodeInTree(result, parent.id, (node) => ({
      ...node,
      children: node.children ? rebuildArrayPaths(node.children, parent.path!) : undefined,
    }));
  }
  return result;
}

export function addChildNode(nodes: TreeNode[], parentId: string): TreeNode[] {
  return addChildNodeOfType(nodes, parentId, 'string');
}

export function addChildNodeOfType(nodes: TreeNode[], parentId: string, childType: JsonNodeType): TreeNode[] {
  return updateNodeInTree(cloneNodes(nodes), parentId, (node) => {
    if (node.type === 'object') {
      const existingKeys = new Set((node.children ?? []).map((c) => c.key).filter((k): k is string => k !== null));
      let index = (node.children?.length ?? 0) + 1;
      let childKey = `key_${index}`;
      while (existingKeys.has(childKey)) {
        index += 1;
        childKey = `key_${index}`;
      }
      const value = defaultValueForType(childType);
      const parentPath = node.path ?? '$';
      const child = createNode(childKey, value, parentPath);
      return {
        ...node,
        expanded: true,
        children: [...(node.children ?? []), child],
      };
    }
    if (node.type === 'array') {
      const parentPath = node.path ?? '$';
      const index = node.children?.length ?? 0;
      const value = defaultValueForType(childType);
      const child = createNode(null, value, parentPath, index);
      return {
        ...node,
        expanded: true,
        children: [...(node.children ?? []), child],
      };
    }
    return node;
  });
}
