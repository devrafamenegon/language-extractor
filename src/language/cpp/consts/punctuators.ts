/**
 * Pontuadores e operadores do C++.
 * Observação: ordenar por comprimento decrescente favorece longest-match.
 * Exemplo: `getPunctuatorRegex().exec('a += b;') // ['+=']`
 */
export const cppPunctuators: ReadonlyArray<string> = [
  '...', '::', '->*', '->', '.*',
  '<<=', '>>=', '+=', '-=', '*=', '/=', '%=', '^=', '&=', '|=', '==', '!=',
  '<=', '>=', '&&', '||', '++', '--', '<<', '>>', '##',
  '+', '-', '*', '/', '%', '^', '&', '|', '~', '!', '=', '<', '>', '?', ':',
  '::', '.', ',', ';', '(', ')', '[', ']', '{', '}'
];

/** Retorna RegExp que casa todos os pontuadores/operadores (longest-first). */
export function getPunctuatorRegex(): RegExp {
  const escaped = [...cppPunctuators]
    .sort((a, b) => b.length - a.length)
    .map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(${escaped.join('|')})`, 'g');
}


