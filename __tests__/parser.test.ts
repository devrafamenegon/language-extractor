import { describe, it, expect } from 'vitest';
import { tokenizeOrdered } from '../src/language/cpp/lexer';
import { parseSyntax } from '../src/language/cpp/parser';
import { ErrorCollector } from '../src/error';

const parseWithCollector = (source: string): ErrorCollector => {
  const tokens = tokenizeOrdered(source);
  const collector = new ErrorCollector();
  parseSyntax(tokens, collector);
  return collector;
};

describe('Análise sintática', () => {
  it('não gera erros para um programa válido simples', () => {
    const collector = parseWithCollector('int x = 10; int y = x + 1;');

    expect(collector.getErrors().sintaticos).toHaveLength(0);
  });

  it('detecta parênteses não fechados', () => {
    const collector = parseWithCollector('int main( { return 0; }');
    const errors = collector.getErrors().sintaticos;
    expect(errors.some(e => e.tipo === 'parentese_nao_fechado')).toBe(true);
  });

  it('detecta chaves não fechadas em blocos', () => {
    const collector = parseWithCollector('int main() { if (1) { return 0; }');
    const errors = collector.getErrors().sintaticos;
    expect(errors.some(e => e.tipo === 'chave_nao_fechada')).toBe(true);
  });
});


