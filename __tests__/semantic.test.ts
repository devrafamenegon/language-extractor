import { describe, it, expect } from 'vitest';
import { tokenizeOrdered } from '../src/languages/cpp/lexer';
import { analyzeSemantics } from '../src/languages/cpp/semantic';
import { ErrorCollector } from '../src/errors';

function getSemanticErrors(source: string) {
  const tokens = tokenizeOrdered(source);
  const collector = new ErrorCollector();
  analyzeSemantics(tokens, collector);
  return collector.getErrors().semanticos;
}

describe('Análise semântica', () => {
  it('não produz erros para declarações e usos válidos', () => {
    const errors = getSemanticErrors(`
      int main() {
        int x = 10;
        int y = x + 1;
        return y;
      }
    `);

    expect(errors).toHaveLength(0);
  });

  it('detecta identificadores não declarados', () => {
    const errors = getSemanticErrors(`
      int main() {
        int y = z + 5;
        return y;
      }
    `);

    expect(errors.some(e => e.tipo === 'identificador_nao_declarado' && e.identificador === 'z')).toBe(true);
  });

  it('detecta redeclaração de identificadores', () => {
    const errors = getSemanticErrors(`
      int main() {
        int x = 10;
        int x = 20;
        return x;
      }
    `);

    expect(errors.some(e => e.tipo === 'identificador_redeclarado' && e.identificador === 'x')).toBe(true);
  });
});


