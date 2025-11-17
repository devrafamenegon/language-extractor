import { ExporterStrategy, ExportContext } from '../ExporterStrategy';
import { formatErrors } from '../../errors';

export class ConsoleExporter implements ExporterStrategy {
  async execute(context: ExportContext): Promise<void> {
    console.log('token, codigo, valor, linha, coluna');
    for (const t of context.tokens) {
      console.log(`${t.tipo}, ${t.codigo}, ${t.valor}, ${t.linha}, ${t.coluna}`);
    }
    
    if (context.errors.total > 0) {
      console.log(formatErrors(context.errors));
      process.exit(1);
    } else {
      console.log('\n✅ Nenhum erro encontrado!\n');
    }
  }
}

// Alias para compatibilidade (deprecado)
export const ConsoleOutputStrategy = ConsoleExporter;
