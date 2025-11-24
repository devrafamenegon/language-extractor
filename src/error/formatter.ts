import { ErrorCollection, AnyError } from './types';

function formatSnippet(trecho?: string): string {
  if (!trecho) return '';
  const normalized = trecho.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 40) return normalized;
  return `${normalized.slice(0, 37)}…`;
}

function formatError(error: AnyError): string {
  const location = `${error.linha}:${error.coluna}`.padEnd(7);
  const snippet = formatSnippet(error.trecho);

  const extras: string[] = [];
  if (error.fase === 'sintatico' && 'esperado' in error && error.esperado) {
    extras.push(`esperado=${error.esperado}`);
    if (error.encontrado) extras.push(`encontrado=${error.encontrado}`);
  }
  if (error.fase === 'semantico' && 'identificador' in error && error.identificador) {
    extras.push(`identificador=${error.identificador}`);
  }

  const extrasStr = extras.length ? ` (${extras.join('; ')})` : '';
  const snippetStr = snippet ? ` | "${snippet}"` : '';

  return `  - ${location} ${error.mensagem}${snippetStr}${extrasStr}`;
}

export function formatErrors(errors: ErrorCollection): string {
  if (errors.total === 0) {
    return '';
  }

  const lines: string[] = [];
  lines.push('\n========== RELATÓRIO DE ERROS ==========');
  lines.push('  linha:coluna → mensagem | contexto');

  const sections: Array<{ title: string; data: AnyError[] }> = [
    { title: 'ANÁLISE LÉXICA', data: errors.lexicos },
    { title: 'ANÁLISE SINTÁTICA', data: errors.sintaticos },
    { title: 'ANÁLISE SEMÂNTICA', data: errors.semanticos },
  ];

  for (const section of sections) {
    if (section.data.length === 0) continue;
    lines.push(`\n[${section.title}] ${section.data.length} erro(s)`);
    for (const error of section.data) {
      lines.push(formatError(error));
    }
  }

  lines.push(`\nTOTAL GERAL: ${errors.total} erro(s)\n`);
  
  return lines.join('\n');
}

export function formatErrorsJson(errors: ErrorCollection): string {
  return JSON.stringify({
    total: errors.total,
    lexicos: errors.lexicos,
    sintaticos: errors.sintaticos,
    semanticos: errors.semanticos,
  }, null, 2);
}

