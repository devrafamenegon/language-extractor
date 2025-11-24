/**
 * Detector de erros léxicos específicos de C++.
 */
import { LexicalError } from '../../../error/types';
import { LexicalErrorType } from '../types';
import { indexToLineCol } from '../../../scanner/position';

export function detectUnclosedStrings(
  sourceCode: string,
  lineStarts: number[],
  startIndex: number
): LexicalError | null {
  let i = startIndex;
  while (i < sourceCode.length) {
    const ch = sourceCode[i];
    
    if (ch === '"') {
      let j = i + 1;
      let escaped = false;
      while (j < sourceCode.length) {
        const cj = sourceCode[j];
        if (escaped) {
          escaped = false;
          j++;
          continue;
        }
        if (cj === '\\') {
          escaped = true;
          j++;
          continue;
        }
        if (cj === '"') {
          break; // String fechada
        }
        if (cj === '\n' || cj === '\r') {
          // String não fechada
          const { line, column } = indexToLineCol(lineStarts, i);
          const trecho = sourceCode.slice(i, Math.min(i + 20, sourceCode.length));
          const trechoLimpo = trecho.includes('\n') ? trecho.split('\n')[0]! : trecho;
          return {
            fase: 'lexico',
            tipo: LexicalErrorType.STRING_NAO_FECHADA,
            mensagem: 'String com aspas duplas não foi fechada',
            linha: line,
            coluna: column,
            trecho: trechoLimpo,
          };
        }
        j++;
      }
      if (j >= sourceCode.length) {
        // String não fechada até o final do arquivo
        const { line, column } = indexToLineCol(lineStarts, i);
        const trecho = sourceCode.slice(i, Math.min(i + 20, sourceCode.length));
        const trechoLimpo = trecho.includes('\n') ? trecho.split('\n')[0]! : trecho;
        return {
          fase: 'lexico',
          tipo: LexicalErrorType.STRING_NAO_FECHADA,
          mensagem: 'String com aspas duplas não foi fechada',
          linha: line,
          coluna: column,
          trecho: trechoLimpo,
        };
      }
      i = j + 1;
      continue;
    }
    
    if (ch === "'") {
      let j = i + 1;
      let escaped = false;
      while (j < sourceCode.length) {
        const cj = sourceCode[j];
        if (escaped) {
          escaped = false;
          j++;
          continue;
        }
        if (cj === '\\') {
          escaped = true;
          j++;
          continue;
        }
        if (cj === "'") {
          break; // Caractere fechado
        }
        if (cj === '\n' || cj === '\r') {
          // Caractere não fechado
          const { line, column } = indexToLineCol(lineStarts, i);
          const trecho = sourceCode.slice(i, Math.min(i + 20, sourceCode.length));
          const trechoLimpo = trecho.includes('\n') ? trecho.split('\n')[0]! : trecho;
          return {
            fase: 'lexico',
            tipo: LexicalErrorType.CARACTERE_NAO_FECHADO,
            mensagem: "Caractere com aspas simples não foi fechado",
            linha: line,
            coluna: column,
            trecho: trechoLimpo,
          };
        }
        j++;
      }
      if (j >= sourceCode.length) {
        // Caractere não fechado até o final do arquivo
        const { line, column } = indexToLineCol(lineStarts, i);
        const trecho = sourceCode.slice(i, Math.min(i + 20, sourceCode.length));
        const trechoLimpo = trecho.includes('\n') ? trecho.split('\n')[0]! : trecho;
        return {
          fase: 'lexico',
          tipo: LexicalErrorType.CARACTERE_NAO_FECHADO,
          mensagem: "Caractere com aspas simples não foi fechado",
          linha: line,
          coluna: column,
          trecho: trechoLimpo,
        };
      }
      i = j + 1;
      continue;
    }
    
    i++;
  }
  
  return null;
}

export function detectUnclosedComments(
  sourceCode: string,
  lineStarts: number[]
): LexicalError | null {
  let i = 0;
  while (i < sourceCode.length - 1) {
    if (sourceCode[i] === '/' && sourceCode[i + 1] === '*') {
      // Início de comentário de bloco
      let j = i + 2;
      let found = false;
      while (j < sourceCode.length - 1) {
        if (sourceCode[j] === '*' && sourceCode[j + 1] === '/') {
          found = true;
          break;
        }
        j++;
      }
      if (!found) {
        // Comentário não fechado
        const { line, column } = indexToLineCol(lineStarts, i);
        const trecho = sourceCode.slice(i, Math.min(i + 30, sourceCode.length));
        const trechoLimpo = trecho.includes('\n') ? trecho.split('\n')[0]! : trecho;
        return {
          fase: 'lexico',
          tipo: LexicalErrorType.COMENTARIO_NAO_FECHADO,
          mensagem: 'Comentário de bloco (/*) não foi fechado',
          linha: line,
          coluna: column,
          trecho: trechoLimpo,
        };
      }
      i = j + 2;
    } else {
      i++;
    }
  }
  return null;
}

export function detectInvalidCharacters(
  sourceCode: string,
  preprocessed: string,
  lineStarts: number[]
): LexicalError[] {
  const errors: LexicalError[] = [];
  
  for (let i = 0; i < preprocessed.length; i++) {
    const ch = preprocessed[i];
    if (!ch) continue;
    
    // Ignora espaços em branco
    if (/\s/.test(ch)) continue;
    
    // Ignora caracteres que já foram processados (strings, comentários já removidos)
    // Verifica se é um caractere que não pode ser reconhecido
    const isValidStart =
      /[0-9A-Za-z_]/.test(ch) || // Números, letras, underscore
      ch === '"' || ch === "'" || // Strings/chars (já verificados separadamente)
      /[()[\]{};,]/.test(ch) || // Delimitadores básicos
      /[+\-*/%=<>!&|^~?:]/.test(ch) || // Operadores básicos
      ch === '.' || ch === '\\'; // Ponto e barra invertida
    
    if (!isValidStart) {
      // Verifica se não é parte de um operador conhecido (já processado)
      // Se chegou aqui, é um caractere inválido
      const { line, column } = indexToLineCol(lineStarts, i);
      const trecho = sourceCode.slice(i, Math.min(i + 10, sourceCode.length));
      
      // Evita duplicatas (verifica se já há erro na mesma posição)
      const alreadyReported = errors.some(
        e => e.linha === line && e.coluna === column
      );
      
      if (!alreadyReported) {
        const trechoLimpo = trecho.includes('\n') ? trecho.split('\n')[0]! : trecho;
        errors.push({
          fase: 'lexico',
          tipo: LexicalErrorType.CARACTERE_INVALIDO,
          mensagem: `Caractere inválido: "${ch}" (código ${ch.charCodeAt(0)})`,
          linha: line,
          coluna: column,
          trecho: trechoLimpo,
        });
      }
    }
  }
  
  return errors;
}



