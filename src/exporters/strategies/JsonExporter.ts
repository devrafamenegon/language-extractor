import * as path from 'path';
import { promises as fs } from 'fs';
import { ExporterStrategy, ExportContext } from '../ExporterStrategy';
import { formatErrors } from '../../errors';

export class JsonExporter implements ExporterStrategy {
  async execute(context: ExportContext): Promise<void> {
    const baseName = path.basename(context.filePath, path.extname(context.filePath));
    const outPath = path.join(context.resultsDir, `${baseName}.tokens.json`);
    const json = JSON.stringify(context.tokens, null, 2);
    
    await fs.writeFile(outPath, json, 'utf8');
    console.log(`Arquivo salvo em: ${outPath}`);
    
    if (context.errors.total > 0) {
      console.log(formatErrors(context.errors));
      process.exit(1);
    }
  }
}

// Alias para compatibilidade (deprecado)
export const JsonOutputStrategy = JsonExporter;

