"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cppPunctuators = void 0;
exports.getPunctuatorRegex = getPunctuatorRegex;
// Punctuators and operators in C++. Longest-first is important for matching.
// Exemplo:
//   const rx = getPunctuatorRegex();
//   'a += b;'.match(rx) // ['+=', ';']
exports.cppPunctuators = [
    '...', '::', '->*', '->', '.*',
    '<<=', '>>=', '+=', '-=', '*=', '/=', '%=', '^=', '&=', '|=', '==', '!=',
    '<=', '>=', '&&', '||', '++', '--', '<<', '>>', '##',
    '+', '-', '*', '/', '%', '^', '&', '|', '~', '!', '=', '<', '>', '?', ':',
    '::', '.', ',', ';', '(', ')', '[', ']', '{', '}'
];
/** Retorna um RegExp que casa todos os pontuadores/operadores (ordem longa-primeiro). */
function getPunctuatorRegex() {
    const escaped = [...exports.cppPunctuators]
        .sort((a, b) => b.length - a.length)
        .map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`(${escaped.join('|')})`, 'g');
}
//# sourceMappingURL=punctuators.js.map