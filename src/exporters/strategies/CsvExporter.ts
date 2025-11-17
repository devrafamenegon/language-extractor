import * as path from 'path';
import { promises as fs } from 'fs';
import { ExporterStrategy, ExportContext } from '../ExporterStrategy';
import { formatErrors } from '../../errors';

export class CsvExporter implements ExporterStrategy {
  async execute(context: ExportContext): Promise<void> {
    const toCsv = (v: unknown): string => {
      const s = String(v ?? '');
      const escaped = s.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const baseName = path.basename(context.filePath, path.extname(context.filePath));
    const outPath = path.join(context.resultsDir, `${baseName}.tokens.csv`);
    const lines: string[] = [];
    
    lines.push(`${toCsv('token')},${toCsv('codigo')},${toCsv('valor')},${toCsv('linha')},${toCsv('coluna')}`);
    for (const t of context.tokens) {
      lines.push(`${toCsv(t.tipo)},${toCsv(t.codigo)},${toCsv(t.valor)},${toCsv(t.linha)},${toCsv(t.coluna)}`);
    }
    
    const csv = lines.join('\n');
    await fs.writeFile(outPath, csv, 'utf8');
    console.log(`Arquivo salvo em: ${outPath}`);
    
    if (context.errors.total > 0) {
      console.log(formatErrors(context.errors));
      process.exit(1);
    }
  }
}

// Alias para compatibilidade (deprecado)
export const CsvOutputStrategy = CsvExporter;

