import { describe, it, expect } from 'vitest';
import { ErrorCollector, formatErrors } from '../src/errors';

describe('ErrorCollector e formatadores', () => {
  it('agrega erros por fase e formata saída legível', () => {
    const collector = new ErrorCollector();

    collector.addLexical({
      fase: 'lexico',
      tipo: 'caractere_invalido',
      mensagem: 'Caractere inválido: "@"',
      linha: 1,
      coluna: 5,
      trecho: '@',
    });

    collector.addSyntactic({
      fase: 'sintatico',
      tipo: 'token_inesperado',
      mensagem: 'Token inesperado',
      linha: 2,
      coluna: 3,
      trecho: ')',
      esperado: ';',
      encontrado: ')',
    });

    collector.addSemantic({
      fase: 'semantico',
      tipo: 'identificador_nao_declarado',
      mensagem: 'Identificador "x" não foi declarado',
      linha: 3,
      coluna: 7,
      trecho: 'x',
      identificador: 'x',
    });

    const errors = collector.getErrors();
    expect(errors.total).toBe(3);
    expect(errors.lexicos).toHaveLength(1);
    expect(errors.sintaticos).toHaveLength(1);
    expect(errors.semanticos).toHaveLength(1);

    const formatted = formatErrors(errors);
    expect(formatted).toContain('RELATÓRIO DE ERROS');
    expect(formatted).toContain('[ANÁLISE LÉXICA] 1 erro(s)');
    expect(formatted).toContain('[ANÁLISE SINTÁTICA] 1 erro(s)');
    expect(formatted).toContain('[ANÁLISE SEMÂNTICA] 1 erro(s)');
    expect(formatted).toContain('TOTAL GERAL: 3');
  });
});


