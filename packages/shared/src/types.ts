export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

export type JsonNodeType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';

export type TreeNode = {
  id: string;
  key: string | null;
  value: JsonValue;
  type: JsonNodeType;
  children?: TreeNode[];
  expanded?: boolean;
};

export type SourceFormat = 'json' | 'jsonc';

export type ParseError = {
  offset: number;
  length: number;
  message: string;
};

export type ParseResult =
  | { ok: true; data: unknown }
  | { ok: false; errors: ParseError[] };
