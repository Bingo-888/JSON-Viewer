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

function valueToTreeNode(key: string | null, value: JsonValue): TreeNode {
  const type = getNodeType(value);
  const node: TreeNode = {
    id: generateNodeId(),
    key,
    value,
    type,
    expanded: type === 'object' || type === 'array',
  };

  if (type === 'object') {
    node.children = Object.entries(value as Record<string, JsonValue>).map(([childKey, childValue]) =>
      valueToTreeNode(childKey, childValue),
    );
  } else if (type === 'array') {
    node.children = (value as JsonValue[]).map((childValue) => valueToTreeNode(null, childValue));
  }

  return node;
}

export function objectToTree(value: JsonValue): TreeNode[] {
  if (value === null || typeof value !== 'object') {
    return [valueToTreeNode(null, value)];
  }

  if (Array.isArray(value)) {
    return value.map((item) => valueToTreeNode(null, item));
  }

  return Object.entries(value).map(([key, childValue]) => valueToTreeNode(key, childValue));
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
