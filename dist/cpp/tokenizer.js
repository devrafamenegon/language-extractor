"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenizeOrdered = tokenizeOrdered;
const keywords_1 = require("./keywords");
const punctuators_1 = require("./punctuators");
const tokenCodes_1 = require("./tokenCodes");
const identifierStart = /[A-Za-z_]/;
const identifierPart = /[A-Za-z0-9_]/;
function* scanTokensOrdered(sourceCode) {
    // Remove comments but preserve content length for indices
    const withoutBlock = sourceCode.replace(/\/\*[\s\S]*?\*\//g, m => ' '.repeat(m.length));
    const withoutLine = withoutBlock.replace(/(^|[^:])\/\/.*$/gm, (m, p1) => p1 + ' '.repeat(m.length - p1.length));
    const punctRx = (0, punctuators_1.getPunctuatorRegex)();
    const counters = {
        palavra_reservada: tokenCodes_1.CODE_BASE.palavra_reservada,
        identificador: tokenCodes_1.CODE_BASE.identificador,
        delimitador: tokenCodes_1.CODE_BASE.delimitador,
        operador_atribuicao: tokenCodes_1.CODE_BASE.operador_atribuicao,
        operador_aritmetico: tokenCodes_1.CODE_BASE.operador_aritmetico,
        operador_relacional: tokenCodes_1.CODE_BASE.operador_relacional,
        operador_logico: tokenCodes_1.CODE_BASE.operador_logico,
        operador_bitwise: tokenCodes_1.CODE_BASE.operador_bitwise,
        operador_incremento: tokenCodes_1.CODE_BASE.operador_incremento,
        operador_shift: tokenCodes_1.CODE_BASE.operador_shift,
        operador_membro: tokenCodes_1.CODE_BASE.operador_membro,
        operador_condicional: tokenCodes_1.CODE_BASE.operador_condicional,
        numero: tokenCodes_1.CODE_BASE.numero,
        string: tokenCodes_1.CODE_BASE.string,
        caractere: tokenCodes_1.CODE_BASE.caractere,
    };
    const nextCode = (tipo) => {
        const code = counters[tipo];
        counters[tipo] = code + 1;
        return code;
    };
    let i = 0;
    while (i < withoutLine.length) {
        const ch = withoutLine[i];
        if (ch === undefined) {
            i++;
            continue;
        }
        // whitespace
        if (/\s/.test(ch)) {
            i++;
            continue;
        }
        // number literal (simple integer)
        if (/[0-9]/.test(ch)) {
            let j = i;
            while (j < withoutLine.length && /[0-9]/.test(withoutLine[j] ?? ''))
                j++;
            const value = sourceCode.slice(i, j);
            const codigo = nextCode('numero');
            yield { tipo: 'numero', codigo, valor: value };
            i = j;
            continue;
        }
        // identifier/keyword
        if (identifierStart.test(ch)) {
            let j = i + 1;
            while (j < withoutLine.length && identifierPart.test(withoutLine[j] ?? ''))
                j++;
            const value = sourceCode.slice(i, j);
            if (keywords_1.cppKeywordSet.has(value)) {
                yield { tipo: 'palavra_reservada', codigo: nextCode('palavra_reservada'), valor: value };
            }
            else {
                yield { tipo: 'identificador', codigo: nextCode('identificador'), valor: value };
            }
            i = j;
            continue;
        }
        // string literal (single or double quotes, basic escapes)
        if (ch === '"' || ch === '\'') {
            const quote = ch;
            let j = i + 1;
            while (j < sourceCode.length) {
                const cj = sourceCode[j];
                if (cj === undefined) {
                    j++;
                    break;
                }
                if (cj === '\\') {
                    j += 2;
                    continue;
                }
                if (cj === quote) {
                    j++;
                    break;
                }
                j++;
            }
            const value = sourceCode.slice(i, j);
            const tipo = quote === '"' ? 'string' : 'caractere';
            const codigo = nextCode(tipo);
            yield { tipo, codigo, valor: value };
            i = j;
            continue;
        }
        // punctuators/operators (longest-first regex)
        punctRx.lastIndex = i;
        const m = punctRx.exec(withoutLine);
        if (m && m.index === i) {
            const tok = m[1] ?? '';
            const value = sourceCode.slice(i, i + tok.length);
            // Classify delimiters vs operator subtypes
            const delimitersSet = new Set(['(', ')', '{', '}', ';', ',', '[', ']']);
            if (delimitersSet.has(tok)) {
                yield { tipo: 'delimitador', codigo: nextCode('delimitador'), valor: value };
            }
            else {
                // operator subtyping
                const isAssignment = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=']).has(tok);
                const isArithmetic = new Set(['+', '-', '*', '/', '%']).has(tok);
                const isRelational = new Set(['==', '!=', '<', '>', '<=', '>=']).has(tok);
                const isLogical = new Set(['&&', '||', '!']).has(tok);
                const isBitwise = new Set(['&', '|', '^', '~']).has(tok);
                const isIncrement = new Set(['++', '--']).has(tok);
                const isShift = new Set(['<<', '>>']).has(tok);
                const isMember = new Set(['.', '->', '::']).has(tok);
                const isConditional = new Set(['?', ':']).has(tok);
                let tipo = 'operador_aritmetico';
                if (isAssignment)
                    tipo = 'operador_atribuicao';
                else if (isRelational)
                    tipo = 'operador_relacional';
                else if (isLogical)
                    tipo = 'operador_logico';
                else if (isBitwise)
                    tipo = 'operador_bitwise';
                else if (isIncrement)
                    tipo = 'operador_incremento';
                else if (isShift)
                    tipo = 'operador_shift';
                else if (isMember)
                    tipo = 'operador_membro';
                else if (isConditional)
                    tipo = 'operador_condicional';
                yield { tipo, codigo: nextCode(tipo), valor: value };
            }
            i += tok.length;
            continue;
        }
        // Unrecognized character; skip to avoid infinite loop
        i++;
    }
}
function tokenizeOrdered(sourceCode) {
    return Array.from(scanTokensOrdered(sourceCode));
}
//# sourceMappingURL=tokenizer.js.map