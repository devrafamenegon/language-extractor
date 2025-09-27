/**
 * Tokenizador por AFN (Thompson) para C/C++.
 * - Constrói AFN combinando regras (WS, número, identificador, strings, pontuadores).
 * - Aplica `matchLongest` com desempate por prioridade por regra.
 * - Emite as mesmas linhas de token do tokenizador manual.
 */
import { cppKeywordSet } from '../grammar/keywords';
import { cppPunctuators } from '../grammar/punctuators';
import { CODE_BASE, TokenRow } from '../tokens/codes';
import { Afn } from '../../../lex/afn/types';
import { charClass, literal, concatenate, alternate, kleeneStar, plus } from '../../../lex/afn/builders';
import { combineAlternation, matchLongest } from '../../../lex/afn/helpers';
import { buildLineStartIndices, indexToLineCol } from '../../../lex/position/lineIndex';
import { stripComments } from '../../../lex/preprocess/stripComments';
import { stripBom } from '../../../lex/preprocess/stripBOM';
import { lineSplicing } from '../../../lex/preprocess/lineSplicing';
import { runPreprocessPipeline } from '../../../lex/preprocess';

// Enum para rótulos do AFN
enum Label {
  WS = 'WS',
  NUM = 'NUM',
  IDENT = 'IDENT',
  STR_D = 'STR_D',
  STR_S = 'STR_S',
  PUNCT = 'PUNCT',
}

/**
 * Constrói o "mega AFN" com regras léxicas rotuladas:
 *  - WS: espaços (ignorado)
 *  - NUM: números
 *  - IDENT: identificadores
 *  - STR_D/STR_S: strings/char (com escapes)
 *  - PUNCT: pontuadores/operadores
 * Regras recebem prioridade para desempate (menor = preferido).
 */
function buildAfn(): Afn {
  const ws = plus(charClass(ch => /\s/.test(ch)));

  const digit = charClass(ch => /[0-9]/.test(ch));
  const number = plus(digit);

  const idStart = charClass(ch => /[A-Za-z_]/.test(ch));
  const idPart = charClass(ch => /[A-Za-z0-9_]/.test(ch));
  const identifier = concatenate(idStart, kleeneStar(idPart));

  // String com aspas duplas: " ( \\ . | caractere normal )* "
  const dq = literal('"');
  const esc = concatenate(literal('\\'), charClass(_c => true));
  const normalDq = charClass(ch => ch !== '"' && ch !== '\\' && ch !== '\n' && ch !== '\r');
  const stringD = concatenate(dq, concatenate(kleeneStar(alternate(esc, normalDq)), dq));

  // Char/string com aspas simples: ' ( \\ . | caractere normal )* '
  const sq = literal("'");
  const normalSq = charClass(ch => ch !== "'" && ch !== '\\' && ch !== '\n' && ch !== '\r');
  const stringS = concatenate(sq, concatenate(kleeneStar(alternate(esc, normalSq)), sq));

  // PUNCT: alternação de todos os literais de pontuadores
  let punct: Afn | null = null;
  const byLen = [...cppPunctuators].sort((a, b) => b.length - a.length);
  for (const p of byLen) {
    const lit = literal(p);
    punct = punct ? alternate(punct, lit) : lit;
  }

  // Combina tudo com rótulos/prioridades usando o helper declarativo
  return combineAlternation([
    { afn: ws, label: Label.WS, priority: 10 },
    { afn: number, label: Label.NUM, priority: 10 },
    { afn: identifier, label: Label.IDENT, priority: 10 },
    { afn: stringD, label: Label.STR_D, priority: 5 },
    { afn: stringS, label: Label.STR_S, priority: 5 },
    { afn: punct!, label: Label.PUNCT, priority: 20 },
  ]);
}

// Mega AFN é construído uma única vez e reutilizado
const megaAfn = buildAfn();

/**
 * Tokeniza preservando índices: usa texto preprocessado para casar,
 * mas recorta lexemas do `sourceCode` original.
 */
export function tokenizeOrderedAfn(sourceCode: string): TokenRow[] {
  const preprocessed = runPreprocessPipeline(sourceCode, [
    stripBom,
    lineSplicing,
    stripComments,
  ]);

  // Obtém os índices de início de cada linha
  const lineStarts = buildLineStartIndices(sourceCode);

  // Cria um contador para cada tipo de token
  const counters: Record<TokenRow['tipo'], number> = {
    palavra_reservada: CODE_BASE.palavra_reservada,
    identificador: CODE_BASE.identificador,
    delimitador: CODE_BASE.delimitador,
    operador: CODE_BASE.operador,
    numero: CODE_BASE.numero,
    string: CODE_BASE.string,
    caractere: CODE_BASE.caractere,
  };

  // Tabela para códigos por valor (mesmo valor => mesmo código por tipo)
  const assigned: Record<TokenRow['tipo'], Map<string, number>> = {
    palavra_reservada: new Map(),
    identificador: new Map(),
    delimitador: new Map(),
    operador: new Map(),
    numero: new Map(),
    string: new Map(),
    caractere: new Map(),
  };

  // Obtém o próximo código para um tipo de token
  const codeFor = (tipo: TokenRow['tipo'], valor: string): number => {
    const table = assigned[tipo];
    const existing = table.get(valor);

    // Se o token já existe, retorna o código existente
    if (existing !== undefined) return existing;

    // Se o token não existe, incrementa o contador e retorna o novo código
    const code = counters[tipo];
    counters[tipo] = code + 1;
    table.set(valor, code);
    return code;
  };

  // Cria um array de tokens
  const tokens: TokenRow[] = [];
  let i = 0;

  // Enquanto houver caracteres para processar
  // Cria um array de tokens
  while (i < preprocessed.length) {
    // Encontra o token mais longo que casa com o AFN
    const longestToken = matchLongest(preprocessed, i, megaAfn);

    // Se não houver token, incrementa o índice e continua
    if (!longestToken || longestToken.length === 0) { i++; continue; }

    // Obtém o índice final do token
    let end = i + longestToken.length;

    // Se o token é uma string, ajusta o índice final para não atravessar strings adjacentes
    if (longestToken.label === Label.STR_D || longestToken.label === Label.STR_S) {
      const quote = sourceCode[i];
      let j = i + 1;
      while (j < sourceCode.length) {
        const cj = sourceCode[j];
        if (cj === undefined) { break; }
        if (cj === '\\') { j += 2; continue; }
        if (cj === quote) { j++; break; }
        j++;
      }
      end = j;
    }

    // Obtém o lexema
    const lexeme = sourceCode.slice(i, end);
    const { line, column } = indexToLineCol(lineStarts, i);

    // Obtém o tipo de token
    switch (longestToken.label) {

      case Label.WS:
        break;

      case Label.NUM:
        tokens.push({ tipo: 'numero', codigo: codeFor('numero', lexeme), valor: lexeme, linha: line, coluna: column });
        break;

      case Label.IDENT: {
        if (cppKeywordSet.has(lexeme)) {
          tokens.push({ tipo: 'palavra_reservada', codigo: codeFor('palavra_reservada', lexeme), valor: lexeme, linha: line, coluna: column });
        } else {
          tokens.push({ tipo: 'identificador', codigo: codeFor('identificador', lexeme), valor: lexeme, linha: line, coluna: column });
        }
        break;
      }

      case Label.STR_D: {
        tokens.push({ tipo: 'string', codigo: codeFor('string', lexeme), valor: lexeme, linha: line, coluna: column });
        break;
      }
      
      case Label.STR_S: {
        tokens.push({ tipo: 'caractere', codigo: codeFor('caractere', lexeme), valor: lexeme, linha: line, coluna: column });
        break;
      }

      case Label.PUNCT: {
        const token = lexeme;
        const delimitersSet = new Set(['(', ')', '{', '}', ';', ',', '[', ']']);
        if (delimitersSet.has(token)) {
          tokens.push({ tipo: 'delimitador', codigo: codeFor('delimitador', token), valor: token, linha: line, coluna: column });
        } else {
          tokens.push({ tipo: 'operador', codigo: codeFor('operador', token), valor: token, linha: line, coluna: column });
        }
        break;
      }
      default:
        break;
    }
    i += (longestToken.label === Label.STR_D || longestToken.label === Label.STR_S) ? (end - i) : longestToken.length;
  }
  return tokens;
}


