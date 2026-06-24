import type { JsonNodeType, JsonValue, TreeNode } from '@json-viewer/shared';
import { generateNodeId } from '@json-viewer/shared';

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

export function parseEditedValue(type: JsonNodeType, text: string): JsonValue {
  switch (type) {
    case 'string':
      return text;
    case 'number': {
      const num = Number(text);
      return Number.isNaN(num) ? 0 : num;
    }
    case 'boolean':
      return text === 'true';
    case 'null':
      return null;
    default:
      return text;
  }
}

function getValueType(value: JsonValue): JsonNodeType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return typeof value as JsonNodeType;
}

export function updateNodeValue(nodes: TreeNode[], id: string, value: JsonValue): TreeNode[] {
  return updateNodeInTree(nodes, id, (node) => {
    if (node.type === 'object' || node.type === 'array') {
      return node;
    }
    return { ...node, value, type: getValueType(value) };
  });
}

export function deleteNode(nodes: TreeNode[], id: string): TreeNode[] {
  return deleteNodeInTree(cloneNodes(nodes), id);
}

function createLeafNode(key: string | null, value: JsonValue): TreeNode {
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : (typeof value as JsonNodeType);
  return {
    id: generateNodeId(),
    key,
    value,
    type: type === 'object' ? 'object' : type,
    expanded: type === 'object' || type === 'array',
    children: type === 'object' || type === 'array' ? [] : undefined,
  };
}

export function addChildNode(nodes: TreeNode[], parentId: string): TreeNode[] {
  return updateNodeInTree(cloneNodes(nodes), parentId, (node) => {
    if (node.type === 'object') {
      const childKey = `key_${(node.children?.length ?? 0) + 1}`;
      const child = createLeafNode(childKey, '');
      return {
        ...node,
        expanded: true,
        children: [...(node.children ?? []), child],
      };
    }
    if (node.type === 'array') {
      const child = createLeafNode(null, null);
      return {
        ...node,
        expanded: true,
        children: [...(node.children ?? []), child],
      };
    }
    return node;
  });
}
