/**
 * Tokenizador manual (loops/regex) para C/C++.
 * - Remove comentários preservando comprimento (mantém índices absolutos).
 * - Reconhece inteiros, identificadores/palavras‑chave, strings/chars e pontuadores/operadores.
 * - Atribui códigos por categoria e calcula posição (linha/coluna) de início.
 */
import { cppKeywordSet } from '../grammar/keywords';
import { getPunctuatorRegex } from '../grammar/punctuators';
import { CODE_BASE, TokenRow } from '../tokens/codes';
import { buildLineStartIndices, indexToLineCol } from '../../../lex/position/lineIndex';
import { stripComments } from '../../../lex/preprocess/stripComments';
import { stripBom } from '../../../lex/preprocess/stripBOM';
import { lineSplicing } from '../../../lex/preprocess/lineSplicing';
import { runPreprocessPipeline } from '../../../lex/preprocess';

const identifierStart = /[A-Za-z_]/;
const identifierPart = /[A-Za-z0-9_]/;

function* scanTokensOrdered(sourceCode: string): Generator<TokenRow> {
  const preprocessed = runPreprocessPipeline(sourceCode, [
    stripBom,
    lineSplicing,
    stripComments,
  ]);
  const lineStarts = buildLineStartIndices(sourceCode);

  const punctRx = getPunctuatorRegex();
  const counters: Record<TokenRow['tipo'], number> = {
    palavra_reservada: CODE_BASE.palavra_reservada,
    identificador: CODE_BASE.identificador,
    delimitador: CODE_BASE.delimitador,
    operador: CODE_BASE.operador,
    numero: CODE_BASE.numero,
    string: CODE_BASE.string,
    caractere: CODE_BASE.caractere,
  };

  const assigned: Record<TokenRow['tipo'], Map<string, number>> = {
    palavra_reservada: new Map(),
    identificador: new Map(),
    delimitador: new Map(),
    operador: new Map(),
    numero: new Map(),
    string: new Map(),
    caractere: new Map(),
  };

  const codeFor = (tipo: TokenRow['tipo'], valor: string): number => {
    const table = assigned[tipo];
    const existing = table.get(valor);
    if (existing !== undefined) return existing;
    const code = counters[tipo];
    counters[tipo] = code + 1;
    table.set(valor, code);
    return code;
  };

  let i = 0;
  while (i < preprocessed.length) {
    const ch = preprocessed[i];
    if (ch === undefined) { i++; continue; }

    if (/\s/.test(ch)) { i++; continue; }

    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < preprocessed.length && /[0-9]/.test(preprocessed[j] ?? '')) j++;
      const value = sourceCode.slice(i, j);
      const codigo = codeFor('numero', value);
      const { line, column } = indexToLineCol(lineStarts, i);
      yield { tipo: 'numero', codigo, valor: value, linha: line, coluna: column };
      i = j;
      continue;
    }

    if (identifierStart.test(ch)) {
      let j = i + 1;
      while (j < preprocessed.length && identifierPart.test(preprocessed[j] ?? '')) j++;
      const value = sourceCode.slice(i, j);
      const { line, column } = indexToLineCol(lineStarts, i);
      if (cppKeywordSet.has(value)) {
        yield { tipo: 'palavra_reservada', codigo: codeFor('palavra_reservada', value), valor: value, linha: line, coluna: column };
      } else {
        yield { tipo: 'identificador', codigo: codeFor('identificador', value), valor: value, linha: line, coluna: column };
      }
      i = j;
      continue;
    }

    if (ch === '"' || ch === '\'') {
      const quote = ch;
      let j = i + 1;
      while (j < sourceCode.length) {
        const cj = sourceCode[j];
        if (cj === undefined) { j++; break; }
        if (cj === '\\') { j += 2; continue; }
        if (cj === quote) { j++; break; }
        j++;
      }
      const value = sourceCode.slice(i, j);
      const tipo = quote === '"' ? 'string' : 'caractere';
      const codigo = codeFor(tipo, value);
      const { line, column } = indexToLineCol(lineStarts, i);
      yield { tipo, codigo, valor: value, linha: line, coluna: column };
      i = j;
      continue;
    }

    punctRx.lastIndex = i;
    const m = punctRx.exec(preprocessed);
    if (m && m.index === i) {
      const tok = m[1] ?? '';
      const value = sourceCode.slice(i, i + tok.length);
      const delimitersSet = new Set(['(', ')', '{', '}', ';', ',', '[', ']']);
      const { line, column } = indexToLineCol(lineStarts, i);
      if (delimitersSet.has(tok)) {
        yield { tipo: 'delimitador', codigo: codeFor('delimitador', value), valor: value, linha: line, coluna: column };
      } else {
        yield { tipo: 'operador', codigo: codeFor('operador', value), valor: value, linha: line, coluna: column };
      }
      i += tok.length;
      continue;
    }

    i++;
  }
}

export function tokenizeOrdered(sourceCode: string): TokenRow[] {
  return Array.from(scanTokensOrdered(sourceCode));
}


