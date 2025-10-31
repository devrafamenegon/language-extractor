/**
 * CLI do analisador léxico de C/C++.
 *
 * 
 * Opções:
 *  - `--json`: salva tokens em `./<arquivo>.tokens.json`
 *  - `--csv`:  salva tokens em `./<arquivo>.tokens.csv`
 *  - `--afn`:  usa tokenização por AFN (em vez da manual)
 *
 * Exemplos de uso:
 *  - `npm run dev -- samples/hello.cpp`
 *  - `npm run dev -- --json samples/hello.cpp`
 *  - `npm run dev -- --csv samples/hello.cpp`
 *  - `npm run dev -- --afn --json samples/hello.cpp`
 */
 
import * as path from 'path';
import { promises as fs } from 'fs';
import { readTextFile } from './utils/readTextFile';
import { tokenizeOrdered } from './languages/cpp/tokenize/manual';
import { tokenizeOrderedAfn } from './languages/cpp/tokenize/afn';

async function main(): Promise<void> {
  // Obtém os argumentos da linha de comando
  const argv = process.argv;
  const hasJsonFlag = argv.includes('--json');
  const hasCsvFlag = argv.includes('--csv');
  const useAfn = argv.includes('--afn');
  const positional = argv.filter(a => !a.startsWith('--'));
  const [_nodePath, _scriptPath, cppFilePath] = positional;

  // Verifica se o arquivo C++ foi informado
  const isMissingArgument = !cppFilePath;
  if (isMissingArgument) {
    console.error('Use: npm run dev -- [--json|--csv] <caminho-do-arquivo.cpp>');
    process.exit(1);
  }

  const absolutePath = path.resolve(process.cwd(), cppFilePath);

  // Inicia o processo de tokenização
  try {
    const sourceCode = await readTextFile(absolutePath);
    const tokens = useAfn ? tokenizeOrderedAfn(sourceCode) : tokenizeOrdered(sourceCode);

    if (hasJsonFlag) {
      const baseName = path.basename(cppFilePath, path.extname(cppFilePath));
      const resultsDir = path.join(process.cwd(), 'results');
      await fs.mkdir(resultsDir, { recursive: true });
      const outPath = path.join(resultsDir, `${baseName}.tokens.json`);
      const json = JSON.stringify(tokens, null, 2);
      await fs.writeFile(outPath, json, 'utf8');
      console.log(`Arquivo salvo em: ${outPath}`);
      return;
    }

    if (hasCsvFlag) {
      const toCsv = (v: unknown): string => {
        const s = String(v ?? '');
        const escaped = s.replace(/"/g, '""');
        return `"${escaped}"`;
      };
      const baseName = path.basename(cppFilePath, path.extname(cppFilePath));
      const resultsDir = path.join(process.cwd(), 'results');
      await fs.mkdir(resultsDir, { recursive: true });
      const outPath = path.join(resultsDir, `${baseName}.tokens.csv`);
      const lines: string[] = [];
      lines.push(`${toCsv('token')},${toCsv('codigo')},${toCsv('valor')},${toCsv('linha')},${toCsv('coluna')}`);
      for (const t of tokens) {
        lines.push(`${toCsv(t.tipo)},${toCsv(t.codigo)},${toCsv(t.valor)},${toCsv(t.linha)},${toCsv(t.coluna)}`);
      }
      const csv = lines.join('\n');
      await fs.writeFile(outPath, csv, 'utf8');
      console.log(`Arquivo salvo em: ${outPath}`);
      return;
    }

    // Exibe os tokens no console
    console.log('token, codigo, valor, linha, coluna');
    for (const t of tokens) {
      console.log(`${t.tipo}, ${t.codigo}, ${t.valor}, ${t.linha}, ${t.coluna}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Falha ao ler o arquivo: ${message}`);
    process.exit(1);
  }
}

main();
