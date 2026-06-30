import type { JsonNodeType, JsonValue, TreeNode } from './types.js';

let nodeIdCounter = 0;

export function generateNodeId(): string {
  const webCrypto = globalThis.crypto;
  if (webCrypto && typeof webCrypto.randomUUID === 'function') {
    return webCrypto.randomUUID();
  }

  nodeIdCounter += 1;
  return `node-${nodeIdCounter}`;
}

function getNodeType(value: JsonValue): JsonNodeType {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  return typeof value as JsonNodeType;
}

function childPath(parentPath: string, key: string | null, index?: number): string {
  if (key !== null) {
    return `${parentPath}.${key}`;
  }
  if (index !== undefined) {
    return `${parentPath}[${index}]`;
  }
  return parentPath;
}

function valueToTreeNode(key: string | null, value: JsonValue, parentPath = '$'): TreeNode {
  const type = getNodeType(value);
  const path = key !== null ? childPath(parentPath, key) : parentPath;
  const node: TreeNode = {
    id: generateNodeId(),
    key,
    value,
    type,
    path,
    expanded: type === 'object' || type === 'array',
  };

  if (type === 'object') {
    node.children = Object.entries(value as Record<string, JsonValue>).map(([childKey, childValue]) =>
      valueToTreeNode(childKey, childValue, path),
    );
  } else if (type === 'array') {
    node.children = (value as JsonValue[]).map((childValue, index) =>
      valueToTreeNode(null, childValue, childPath(path, null, index)),
    );
  }

  return node;
}

/** 始终返回单根节点树，空 object/array 也可在树中编辑 */
export function objectToTree(value: JsonValue): TreeNode[] {
  return [valueToTreeNode(null, value)];
}

function treeNodeToValue(node: TreeNode): JsonValue {
  if (node.type === 'object') {
    const result: Record<string, JsonValue> = {};
    for (const child of node.children ?? []) {
      if (child.key === null) {
        continue;
      }
      result[child.key] = treeNodeToValue(child);
    }
    return result;
  }

  if (node.type === 'array') {
    return (node.children ?? []).map((child) => treeNodeToValue(child));
  }

  return node.value;
}

export function treeToObject(nodes: TreeNode[]): JsonValue {
  if (nodes.length === 0) {
    return null;
  }

  if (nodes.length === 1 && nodes[0].key === null) {
    return treeNodeToValue(nodes[0]);
  }

  const result: Record<string, JsonValue> = {};
  for (const node of nodes) {
    if (node.key === null) {
      continue;
    }
    result[node.key] = treeNodeToValue(node);
  }
  return result;
}
