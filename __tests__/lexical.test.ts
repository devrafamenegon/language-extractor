import { describe, it, expect } from 'vitest';
import { tokenizeOrdered, tokenizeOrderedAfn } from '../src/language/cpp/lexer';
import { ErrorCollector } from '../src/error';

const validSource = `
int main() {
  int x = 10;
  return x;
}
`;

describe('Tokenizadores léxicos', () => {
  it('tokenizador manual gera tokens consistentes sem erros', () => {
    const collector = new ErrorCollector();
    const tokens = tokenizeOrdered(validSource, collector);

    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[0]).toMatchObject({ tipo: 'palavra_reservada', valor: 'int' });
    expect(tokens.some(t => t.tipo === 'identificador' && t.valor === 'main')).toBe(true);
    expect(collector.getErrors().lexicos).toHaveLength(0);
  });

  it('tokenizador AFN mantém mesma sequência de lexemas', () => {
    const manualTokens = tokenizeOrdered(validSource);
    const afnTokens = tokenizeOrderedAfn(validSource);

    expect(afnTokens.map(t => t.valor)).toEqual(manualTokens.map(t => t.valor));
  });

  it('reporta erros léxicos quando strings não são fechadas', () => {
    const collector = new ErrorCollector();
    tokenizeOrdered('int main() { char* msg = "oops; }', collector);

    const lexErrors = collector.getErrors().lexicos;
    expect(lexErrors.some(e => e.tipo === 'string_nao_fechada')).toBe(true);
  });
});


