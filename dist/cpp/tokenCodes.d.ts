/** Código inicial (base) por categoria; incrementa sequencial por ocorrência. */
export declare const CODE_BASE: {
    readonly palavra_reservada: 101;
    readonly identificador: 201;
    readonly delimitador: 301;
    readonly operador_atribuicao: 401;
    readonly operador_aritmetico: 411;
    readonly operador_relacional: 421;
    readonly operador_logico: 431;
    readonly operador_bitwise: 441;
    readonly operador_incremento: 451;
    readonly operador_shift: 461;
    readonly operador_membro: 471;
    readonly operador_condicional: 481;
    readonly numero: 501;
    readonly string: 601;
    readonly caractere: 701;
};
export type TokenRow = {
    tipo: 'palavra_reservada' | 'identificador' | 'delimitador' | 'operador_atribuicao' | 'operador_aritmetico' | 'operador_relacional' | 'operador_logico' | 'operador_bitwise' | 'operador_incremento' | 'operador_shift' | 'operador_membro' | 'operador_condicional' | 'numero' | 'string' | 'caractere';
    codigo: number;
    valor: string;
};
//# sourceMappingURL=tokenCodes.d.ts.map