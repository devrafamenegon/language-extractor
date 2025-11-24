/**
 * Tokenizador manual (loops/regex) para C/C++.
 * - Remove comentários preservando comprimento (mantém índices absolutos).
 * - Reconhece inteiros, identificadores/palavras‑chave, strings/chars e pontuadores/operadores.
 * - Atribui códigos por categoria e calcula posição (linha/coluna) de início.
 * - Detecta e reporta erros léxicos.
 */
import { cppKeywordSet } from '../consts/keywords';
import { getPunctuatorRegex } from '../consts/punctuators';
import { CODE_BASE, TokenRow } from '../consts/codes';
import { buildLineStartIndices, indexToLineCol } from '../../../scanner/position';
import { stripComments, stripBom, lineSplicing, runPreprocessPipeline } from '../../../scanner/preprocessing';
import { ErrorCollector } from '../../../error/ErrorCollector';
import { detectUnclosedStrings, detectUnclosedComments, detectInvalidCharacters } from './LexicalErrorDetector';

const identifierStart = /[A-Za-z_]/;
const identifierPart = /[A-Za-z0-9_]/;

function* scanTokensOrdered(sourceCode: string, errorCollector?: ErrorCollector): Generator<TokenRow> {
  const preprocessed = runPreprocessPipeline(sourceCode, [
    stripBom,
    lineSplicing,
    stripComments,
  ]);
  const lineStarts = buildLineStartIndices(sourceCode);
  
  // Detecta erros léxicos SOMENTE em comentários não fechados
  // (outros erros são detectados durante a tokenização no código preprocessado)
  if (errorCollector) {
    // Detecta comentários não fechados (precisa ser no código original)
    const unclosedComment = detectUnclosedComments(sourceCode, lineStarts);
    if (unclosedComment) {
      errorCollector.addLexical(unclosedComment);
    }
    
    // Strings/caracteres não fechados são detectados durante a tokenização
    // para evitar falsos positivos em comentários
  }

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
      let closed = false;
      while (j < sourceCode.length) {
        const cj = sourceCode[j];
        if (cj === undefined) { j++; break; }
        if (cj === '\\') { j += 2; continue; }
        if (cj === quote) { j++; closed = true; break; }
        if (cj === '\n' || cj === '\r') {
          // String/caractere não fechado - erro já detectado acima, mas vamos reportar aqui também
          break;
        }
        j++;
      }
      const value = sourceCode.slice(i, j);
      
      // Se não foi fechado, não gera token e reporta erro se ainda não foi reportado
      if (!closed && errorCollector) {
        const { line, column } = indexToLineCol(lineStarts, i);
        const tipo = quote === '"' ? 'string_nao_fechada' : 'caractere_nao_fechado';
        const trecho = value.slice(0, Math.min(20, value.length));
        const trechoStr = trecho.includes('\n') ? trecho.split('\n')[0]! : trecho;
        errorCollector.addLexical({
          fase: 'lexico',
          tipo: tipo as 'string_nao_fechada' | 'caractere_nao_fechado',
          mensagem: quote === '"' 
            ? 'String com aspas duplas não foi fechada' 
            : 'Caractere com aspas simples não foi fechado',
          linha: line,
          coluna: column,
          trecho: trechoStr,
        });
        i = j;
        continue;
      }
      
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

    // Caractere não reconhecido - possível erro léxico
    if (errorCollector) {
      const { line, column } = indexToLineCol(lineStarts, i);
      const trecho = sourceCode.slice(i, Math.min(i + 10, sourceCode.length));
      const alreadyReported = errorCollector.getErrors().lexicos.some(
        e => e.linha === line && e.coluna === column && e.tipo === 'caractere_invalido'
      );
      if (!alreadyReported) {
        const trechoStr = trecho.includes('\n') ? trecho.split('\n')[0]! : trecho;
        errorCollector.addLexical({
          fase: 'lexico',
          tipo: 'caractere_invalido',
          mensagem: `Caractere inválido: "${ch}" (código ${ch.charCodeAt(0)})`,
          linha: line,
          coluna: column,
          trecho: trechoStr,
        });
      }
    }
    
    i++;
  }
  
  // Detecta caracteres inválidos restantes no final
  if (errorCollector) {
    const invalidChars = detectInvalidCharacters(sourceCode, preprocessed, lineStarts);
    for (const error of invalidChars) {
      errorCollector.addLexical(error);
    }
  }
}

export function tokenize(sourceCode: string, errorCollector?: ErrorCollector): TokenRow[] {
  return Array.from(scanTokensOrdered(sourceCode, errorCollector));
}

