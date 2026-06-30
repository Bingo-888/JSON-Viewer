import { describe, expect, it } from 'vitest';
import { objectToTree, type TreeNode } from '@json-viewer/shared';
import {
  addChildNodeOfType,
  deleteNode,
  parseEditedValue,
  renameNodeKey,
  updateNodeValue,
} from './treeOps.js';
import { collectExpandedByPath, findNodeByPath, mergeExpandedByPath } from './treePath.js';

function getRootObject(nodes: TreeNode[]) {
  return nodes[0];
}

describe('treePath', () => {
  it('collects and merges expanded state by path', () => {
    const nodes = objectToTree({ a: { b: 1 } });
    nodes[0].expanded = false;
    nodes[0].children![0].expanded = false;
    const map = collectExpandedByPath(nodes);
    expect(map.get('$')).toBe(false);
    expect(map.get('$.a')).toBe(false);

    const fresh = objectToTree({ a: { b: 1 } });
    const merged = mergeExpandedByPath(fresh, map);
    expect(merged[0].expanded).toBe(false);
    expect(merged[0].children![0].expanded).toBe(false);
  });

  it('finds node by path', () => {
    const nodes = objectToTree({ x: 1 });
    expect(findNodeByPath(nodes, '$.x')?.value).toBe(1);
    expect(findNodeByPath(nodes, '$.missing')).toBeNull();
  });
});

describe('treeOps', () => {
  it('parseEditedValue rejects invalid number', () => {
    expect(parseEditedValue('number', 'abc').ok).toBe(false);
    expect(parseEditedValue('number', '42').ok).toBe(true);
  });

  it('parseEditedValue rejects non-boolean strings', () => {
    expect(parseEditedValue('boolean', 'yes').ok).toBe(false);
    expect(parseEditedValue('boolean', 'true').ok).toBe(true);
  });

  it('adds typed child to object', () => {
    let nodes = objectToTree({});
    const root = getRootObject(nodes);
    nodes = addChildNodeOfType(nodes, root.id, 'number');
    const child = getRootObject(nodes).children![0];
    expect(child.type).toBe('number');
    expect(child.value).toBe(0);
  });

  it('adds object child to array', () => {
    let nodes = objectToTree([]);
    const root = getRootObject(nodes);
    nodes = addChildNodeOfType(nodes, root.id, 'object');
    const child = getRootObject(nodes).children![0];
    expect(child.type).toBe('object');
    expect(child.children).toEqual([]);
  });

  it('renames object key', () => {
    let nodes = objectToTree({ oldKey: 'v' });
    const child = getRootObject(nodes).children![0];
    const result = renameNodeKey(nodes, child.id, 'newKey');
    expect(result.ok).toBe(true);
    if (result.ok) {
      nodes = result.nodes;
      expect(getRootObject(nodes).children![0].key).toBe('newKey');
      expect(getRootObject(nodes).children![0].path).toBe('$.newKey');
    }
  });

  it('rejects duplicate key on rename', () => {
    const nodes = objectToTree({ a: 1, b: 2 });
    const childB = getRootObject(nodes).children!.find((c) => c.key === 'b')!;
    const result = renameNodeKey(nodes, childB.id, 'a');
    expect(result.ok).toBe(false);
  });

  it('updates leaf value', () => {
    let nodes = objectToTree({ n: 1 });
    const child = getRootObject(nodes).children![0];
    nodes = updateNodeValue(nodes, child.id, 99);
    expect(getRootObject(nodes).children![0].value).toBe(99);
  });

  it('deletes nested node', () => {
    let nodes = objectToTree({ a: { b: 1 } });
    const inner = getRootObject(nodes).children![0].children![0];
    nodes = deleteNode(nodes, inner.id);
    expect(getRootObject(nodes).children![0].children).toEqual([]);
  });
});
