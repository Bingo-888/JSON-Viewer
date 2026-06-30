import { describe, expect, it } from 'vitest';
import { objectToTree, treeToObject } from './tree.js';

describe('objectToTree / treeToObject', () => {
  it('round-trips empty object', () => {
    const nodes = objectToTree({});
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('object');
    expect(nodes[0].key).toBeNull();
    expect(nodes[0].children).toEqual([]);
    expect(treeToObject(nodes)).toEqual({});
  });

  it('round-trips empty array', () => {
    const nodes = objectToTree([]);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('array');
    expect(nodes[0].children).toEqual([]);
    expect(treeToObject(nodes)).toEqual([]);
  });

  it('round-trips nested object', () => {
    const value = { hello: 'world', nested: { a: 1 } };
    expect(treeToObject(objectToTree(value))).toEqual(value);
  });

  it('round-trips array with items', () => {
    const value = [1, 'two', null];
    expect(treeToObject(objectToTree(value))).toEqual(value);
  });

  it('round-trips scalar root', () => {
    expect(treeToObject(objectToTree('hello'))).toBe('hello');
    expect(treeToObject(objectToTree(42))).toBe(42);
    expect(treeToObject(objectToTree(true))).toBe(true);
    expect(treeToObject(objectToTree(null))).toBeNull();
  });

  it('assigns paths to nodes', () => {
    const nodes = objectToTree({ name: 'test' });
    expect(nodes[0].path).toBe('$');
    expect(nodes[0].children?.[0].path).toBe('$.name');
  });

  it('assigns array index paths', () => {
    const nodes = objectToTree([10, 20]);
    expect(nodes[0].path).toBe('$');
    expect(nodes[0].children?.[0].path).toBe('$[0]');
    expect(nodes[0].children?.[1].path).toBe('$[1]');
  });

  it('treeToObject returns null for empty nodes', () => {
    expect(treeToObject([])).toBeNull();
  });
});
