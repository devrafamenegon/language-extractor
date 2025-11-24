import * as path from 'path';
import { promises as fs } from 'fs';
import { ExporterStrategy, ExportContext } from '../ExporterStrategy';
import { formatErrors } from '../../error';

export class CsvExporter implements ExporterStrategy {
  async execute(context: ExportContext): Promise<void> {
    const toCsv = (v: unknown): string => {
      const s = String(v ?? '');
      const escaped = s.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const baseName = path.basename(context.filePath, path.extname(context.filePath));
    
    // Exporta tokens
    const tokensPath = path.join(context.resultsDir, `${baseName}.tokens.csv`);
    const lines: string[] = [];
    
    lines.push(`${toCsv('token')},${toCsv('codigo')},${toCsv('valor')},${toCsv('linha')},${toCsv('coluna')}`);
    for (const t of context.tokens) {
      lines.push(`${toCsv(t.tipo)},${toCsv(t.codigo)},${toCsv(t.valor)},${toCsv(t.linha)},${toCsv(t.coluna)}`);
    }
    
    const csv = lines.join('\n');
    await fs.writeFile(tokensPath, csv, 'utf8');
    console.log(`Tokens salvos em: ${tokensPath}`);
    
    // Exporta erros
    if (context.errors.total > 0) {
      const errorsPath = path.join(context.resultsDir, `${baseName}.errors.csv`);
      const errorLines: string[] = [];
      
      errorLines.push(`${toCsv('tipo')},${toCsv('linha')},${toCsv('coluna')},${toCsv('mensagem')},${toCsv('contexto')}`);
      
      for (const err of context.errors.lexicos) {
        errorLines.push(`${toCsv('LÉXICO')},${toCsv(err.linha)},${toCsv(err.coluna)},${toCsv(err.mensagem)},${toCsv(err.trecho || '')}`);
      }
      
      for (const err of context.errors.sintaticos) {
        errorLines.push(`${toCsv('SINTÁTICO')},${toCsv(err.linha)},${toCsv(err.coluna)},${toCsv(err.mensagem)},${toCsv(err.trecho || '')}`);
      }
      
      for (const err of context.errors.semanticos) {
        errorLines.push(`${toCsv('SEMÂNTICO')},${toCsv(err.linha)},${toCsv(err.coluna)},${toCsv(err.mensagem)},${toCsv(err.trecho || '')}`);
      }
      
      const errorsCsv = errorLines.join('\n');
      await fs.writeFile(errorsPath, errorsCsv, 'utf8');
      console.log(`Erros salvos em: ${errorsPath}`);
      
      console.log(formatErrors(context.errors));
      process.exit(1);
    }
  }
}

// Alias para compatibilidade (deprecado)
export const CsvOutputStrategy = CsvExporter;

