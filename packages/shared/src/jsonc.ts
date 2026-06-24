import { parse, ParseErrorCode, type ParseError as JsoncParseError } from 'jsonc-parser';
import type { ParseError, ParseResult } from './types.js';

const ERROR_MESSAGES: Record<ParseErrorCode, string> = {
  [ParseErrorCode.InvalidSymbol]: 'Invalid symbol',
  [ParseErrorCode.InvalidNumberFormat]: 'Invalid number format',
  [ParseErrorCode.PropertyNameExpected]: 'Property name expected',
  [ParseErrorCode.ValueExpected]: 'Value expected',
  [ParseErrorCode.ColonExpected]: 'Colon expected',
  [ParseErrorCode.CommaExpected]: 'Comma expected',
  [ParseErrorCode.CloseBraceExpected]: 'Close brace expected',
  [ParseErrorCode.CloseBracketExpected]: 'Close bracket expected',
  [ParseErrorCode.EndOfFileExpected]: 'End of file expected',
  [ParseErrorCode.InvalidCommentToken]: 'Invalid comment token',
  [ParseErrorCode.UnexpectedEndOfComment]: 'Unexpected end of comment',
  [ParseErrorCode.UnexpectedEndOfString]: 'Unexpected end of string',
  [ParseErrorCode.UnexpectedEndOfNumber]: 'Unexpected end of number',
  [ParseErrorCode.InvalidUnicode]: 'Invalid unicode',
  [ParseErrorCode.InvalidEscapeCharacter]: 'Invalid escape character',
  [ParseErrorCode.InvalidCharacter]: 'Invalid character',
};

function toParseErrors(errors: JsoncParseError[]): ParseError[] {
  return errors.map((error) => ({
    offset: error.offset,
    length: error.length,
    message: ERROR_MESSAGES[error.error] ?? `Parse error (${error.error})`,
  }));
}

export function isLikelyJsonc(text: string, filename?: string): boolean {
  if (filename?.toLowerCase().endsWith('.jsonc')) {
    return true;
  }

  return /\/\/|\/\*|,\s*[}\]]/.test(text);
}

export function parseJsonc(text: string): ParseResult {
  const errors: JsoncParseError[] = [];
  const data = parse(text, errors, { allowTrailingComma: true });

  if (errors.length > 0) {
    return { ok: false, errors: toParseErrors(errors) };
  }

  return { ok: true, data };
}

export function stringifyJson(data: unknown, indent = 2): string {
  return JSON.stringify(data, null, indent);
}
