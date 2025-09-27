"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODE_BASE = void 0;
/** Código inicial (base) por categoria; incrementa sequencial por ocorrência. */
exports.CODE_BASE = {
    palavra_reservada: 101,
    identificador: 201,
    delimitador: 301,
    // Operadores por subtipo (bases distintas para não colidir entre si)
    operador_atribuicao: 401,
    operador_aritmetico: 411,
    operador_relacional: 421,
    operador_logico: 431,
    operador_bitwise: 441,
    operador_incremento: 451,
    operador_shift: 461,
    operador_membro: 471,
    operador_condicional: 481,
    numero: 501,
    string: 601,
    caractere: 701,
};
//# sourceMappingURL=tokenCodes.js.map