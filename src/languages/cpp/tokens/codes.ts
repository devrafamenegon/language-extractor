/**
 * Códigos base por categoria de token.
 * Cada ocorrência incrementa sequencialmente a partir da base.
 */
export const CODE_BASE = {
  palavra_reservada: 101,
  identificador: 201,
  delimitador: 301,
  operador: 401,
  numero: 501,
  string: 601,
  caractere: 701,
} as const;

/** Linha de saída de token. */
export type TokenRow = {
  tipo:
    | 'palavra_reservada'
    | 'identificador'
    | 'delimitador'
    | 'operador'
    | 'numero'
    | 'string'
    | 'caractere';
  codigo: number;
  valor: string;
  linha: number;
  coluna: number;
};


