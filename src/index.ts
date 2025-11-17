/**
 * CLI do analisador completo de C/C++ (léxico, sintático e semântico).
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
import { Compiler, LexerStage, ParserStage, SemanticStage } from './compiler';
import { ManualLexerStrategy, AfnLexerStrategy, CppParserStrategy, CppSemanticStrategy } from './languages/cpp';
import { 
  ExporterStrategy, 
  ConsoleExporter, 
  JsonExporter, 
  CsvExporter 
} from './exporters';

async function main(): Promise<void> {
  const argv = process.argv;

  const hasJsonFlag = argv.includes('--json');
  const hasCsvFlag = argv.includes('--csv');
  const useAfn = argv.includes('--afn');
  
  const positional = argv.filter(a => !a.startsWith('--'));
  const [_nodePath, _scriptPath, cppFilePath] = positional;

  const isMissingArgument = !cppFilePath;
  if (isMissingArgument) {
    console.error('Use: npm run dev -- [--json|--csv] [--afn] <caminho-do-arquivo.cpp>');
    process.exit(1);
  }

  const absolutePath = path.resolve(process.cwd(), cppFilePath);

  try {
    const sourceCode = await readTextFile(absolutePath);
    
    // Configura as estratégias C++
    const lexerStrategy = useAfn ? new AfnLexerStrategy() : new ManualLexerStrategy();
    const parserStrategy = new CppParserStrategy();
    const semanticStrategy = new CppSemanticStrategy();
    
    // Cria os stages
    const lexer = new LexerStage(lexerStrategy);
    const parser = new ParserStage(parserStrategy);
    const semantic = new SemanticStage(semanticStrategy);
    
    // Executa as 3 fases de análise
    const compiler = new Compiler(lexer, parser, semantic);
    const { tokens, errors } = compiler.compile(sourceCode);

    // Cria diretório de resultados
    const resultsDir = path.join(process.cwd(), 'results');
    await fs.mkdir(resultsDir, { recursive: true });

    // Seleciona a estratégia de saída
    let exporter: ExporterStrategy;
    if (hasJsonFlag) {
      exporter = new JsonExporter();
    } else if (hasCsvFlag) {
      exporter = new CsvExporter();
    } else {
      exporter = new ConsoleExporter();
    }

    // Executa a estratégia selecionada
    await exporter.execute({
      tokens,
      errors,
      filePath: cppFilePath,
      resultsDir
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Falha ao ler o arquivo: ${message}`);
    process.exit(1);
  }
}

main();
