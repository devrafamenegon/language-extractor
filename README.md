# 🚀 Language Extractor

> **Compilador educacional completo para C++** com análise léxica, sintática e semântica.

Projeto didático que demonstra todas as fases de um compilador front-end, incluindo:

- **🔍 Análise Léxica**: Tokenização com duas estratégias (Manual e NFA/Thompson)
- **📝 Análise Sintática**: Parser recursivo descendente
- **🧠 Análise Semântica**: Validação de tipos, escopos e declarações
- **🚨 Sistema de Erros**: Detecção e reporte unificado de todas as fases
- **📤 Exportação**: Múltiplos formatos (Console, JSON, CSV)

---

## 📖 Documentação Completa

Este projeto possui documentação abrangente dividida em dois guias complementares:

### 📚 [CONCEPTS.md](CONCEPTS.md) - Conceitos de Compiladores
**Guia educacional sobre a teoria de compiladores**
- O que é um compilador e como funciona
- Pré-processamento e pipeline de transformações
- Análise Léxica: tokenização, AFN, longest-match
- Análise Sintática: gramáticas, parser recursivo descendente
- Análise Semântica: tabela de símbolos, escopo
- Sistema de erros e recuperação em pânico
- Exemplos passo a passo do fluxo completo

### 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura Técnica
**Detalhes de implementação e design**
- Arquitetura do sistema e separação de responsabilidades
- Padrões de design (Strategy, Pipeline, Collector, Builder, Facade)
- Estrutura de diretórios e módulos
- Implementação detalhada de cada componente
- Sistema de tipos e genéricos
- Extensibilidade: como adicionar novas linguagens e formatos
- Performance, complexidades e otimizações

---

### Requisitos
- Node.js 18+

### Instalação
```bash
npm install
```

### Scripts
- `npm run dev` – executa a CLI com tsx (sem watch)
- `npm run dev:watch` – executa a CLI com tsx (hot reload)
- `npm run build` – compila TypeScript para `dist/`
- `npm start` – executa `dist/index.js` (requer build prévio)
- `npm test` – executa a suíte de testes unitários (Vitest)
- `npm run test:watch` – executa os testes em modo watch
- `npm run test:coverage` – gera relatório de cobertura

### Testes
```bash
# Executa toda a suíte uma única vez
npm test

# Ambiente interativo com watch
npm run test:watch

# Relatório de cobertura (textual + HTML em ./coverage)
npm run test:coverage
```

### Uso da CLI
```bash
# Modo padrão: imprime tokens no console + relatório de erros (se houver)
npm run dev -- samples/hello.cpp

# JSON: salva em results/<arquivo>.tokens.json
npm run dev -- --json samples/hello.cpp

# CSV: salva em results/<arquivo>.tokens.csv
npm run dev -- --csv samples/hello.cpp

# Usar o tokenizador por AFN (combinável com outras flags)
npm run dev -- --afn --json samples/hello.cpp
npm run dev -- --afn --csv samples/hello.cpp

# Execução após build (equivalente ao dev, mas com dist/)
npm run build && npm start -- --json samples/hello.cpp
```

**IMPORTANTE**: Independente da flag usada, o sistema **sempre executa as três fases de análise** (léxica, sintática e semântica) e **sempre reporta erros encontrados** ao usuário.

Saídas de exemplo geradas ficam em `results/` (ex.: `hello.tokens.json`, `mixed.tokens.csv`).

### Fluxo ponta a ponta
1. **Leitura do arquivo**: a CLI resolve o caminho informado e lê o conteúdo como UTF-8 (`src/utils/readTextFile.ts`).
2. **Pré-processamento**: aplica a pipeline em `src/scanning/preprocess/index.ts` na ordem: `stripBOM` → `lineSplicing` → `stripComments`. O texto preprocessado é usado apenas para casar tokens, mas os lexemas e posições são extraídos do texto original, preservando offsets corretos.
3. **Análise Léxica** (tokenização): gera uma sequência ordenada de `TokenRow`, cada um com tipo, código, valor e posição de início (linha/coluna 1-based). Detecta erros como strings não fechadas, caracteres inválidos, etc.
4. **Análise Sintática** (parsing): verifica estrutura sintática usando parser recursivo descendente. Detecta erros como parênteses não fechados, tokens inesperados, etc.
5. **Análise Semântica**: verifica identificadores não declarados, redeclarações, incompatibilidade de tipos, etc.
6. **Coleta de erros**: todas as três fases reportam erros para um `ErrorCollector` centralizado.
7. **Saída**:
   - Sem flags: imprime tokens em stdout + relatório de erros (se houver).
   - `--json`: grava `results/<base>.tokens.json` identado + exibe erros no console.
   - `--csv`: grava `results/<base>.tokens.csv` + exibe erros no console.
   - `--errors-json`: grava `results/<base>.errors.json` + exibe erros no console.
8. **Exit code**: retorna código 1 se houver erros em qualquer fase; código 0 se não houver erros.

### Pré-processamento (preserva posições)
- `stripBOM`: remove o BOM inicial, se presente.
- `lineSplicing`: concatena linhas terminadas com `\\\n`, espelhando o pré-processador de C/C++.
- `stripComments`: remove comentários `//` e `/* ... */` mantendo o comprimento, para que os índices absolutos do texto original não mudem. Assim, mesmo casando no texto preprocessado, o lexema e a posição são obtidos do original.

### Tokenização manual (`src/languages/cpp/lexer/implementations/manual.ts`)
- Estratégia: varredura com loops/regex para números, identificadores/palavras-chave, strings/chars e pontuadores/operadores.
- Palavras-chave: são reconhecidas comparando com `cppKeywordSet`.
- Pontuadores/operadores: casados por regex construída a partir de `punctuators` (ordem longa-primeiro).
- Códigos: por tipo, começando em `CODE_BASE` (ex.: identificadores a partir de 201). O mesmo lexema por tipo mantém o mesmo código.
- Posição: mapeada via `buildLineStartIndices` e `indexToLineCol` a partir do índice absoluto no texto original.

### Tokenização por AFN (`src/languages/cpp/lexer/implementations/afn.ts`)
- Construção: usa combinadores de Thompson em `src/scanning/afn` para compor regras rotuladas (WS, número, identificador, strings, pontuadores) com prioridade.
- Casamento: `matchLongest` encontra o maior match no texto preprocessado; em empate de comprimento, escolhe a menor prioridade (preferência para strings sobre pontuadores, por exemplo).
- Classificação: rótulos são mapeados para `TokenRow` (WS é ignorado). Palavras-chave são diferenciadas de identificadores via `cppKeywordSet`.
- Posição/lexema: extraídos do texto original usando o intervalo casado no preprocessado, garantindo offsets corretos mesmo com remoção de comentários.

### Mapeamento de posição (linha/coluna)
- Linha/coluna são 1-based.
- `buildLineStartIndices` cria um índice de inícios de linha do texto original.
- `indexToLineCol` converte um índice absoluto para `(linha, coluna)` considerando essa tabela.

### Formatos de saída
- Console (stdout):
  - Cabeçalho: `token, codigo, valor, linha, coluna`
  - Cada linha: `tipo, codigo, valor, linha, coluna`
- JSON (`--json`): array de objetos `TokenRow`, identado.
- CSV (`--csv`): cabeçalho seguido de linhas; todos os campos entre aspas, `"` duplicado para escape.

Exemplo JSON (trecho):
```json
[
  { "tipo": "palavra_reservada", "codigo": 101, "valor": "int", "linha": 1, "coluna": 1 },
  { "tipo": "identificador", "codigo": 201, "valor": "main", "linha": 1, "coluna": 5 }
]
```

Exemplo CSV (trecho):
```csv
"token","codigo","valor","linha","coluna"
"palavra_reservada","101","int","1","1"
"identificador","201","main","1","5"
```

### Exemplos de ponta a ponta
```bash
# Tokens no console + erros (se houver)
npm run dev -- samples/hello.cpp

# Gera JSON e CSV para o mesmo arquivo (em results/)
npm run dev -- --json samples/mixed.cpp
npm run dev -- --csv  samples/mixed.cpp

# AFN + JSON
npm run dev -- --afn --json samples/operators.cpp
```

### Como estender

#### Adicionar nova estratégia de tokenização
1. Adicione a nova classe em `src/languages/cpp/lexer/strategies.ts`:
   ```typescript
   /**
    * Estratégia de tokenização baseada em regex.
    */
   export class RegexTokenizationStrategy implements TokenizationStrategy {
     tokenize(sourceCode: string, errorCollector: ErrorCollector): TokenRow[] {
       // Implementar tokenização baseada em regex
       return tokens;
     }
   }
   ```

2. A estratégia é automaticamente exportada através de `index.ts`

3. Use no `LexerStage`:
   ```typescript
   import { RegexTokenizationStrategy } from '../../languages';
   
   constructor(strategy: 'manual' | 'afn' | 'regex' = 'manual') {
     if (strategy === 'regex') {
       this.strategy = new RegexTokenizationStrategy();
     } else if (strategy === 'afn') {
       this.strategy = new AfnTokenizationStrategy();
     } else {
       this.strategy = new ManualTokenizationStrategy();
     }
   }
   ```

#### Adicionar novos formatos de saída (Strategy)
1. Crie uma nova classe em `src/output/strategies/`:
   ```typescript
   // XmlOutputStrategy.ts
   import { OutputStrategy, OutputContext } from '../OutputStrategy';
   
   export class XmlOutputStrategy implements OutputStrategy {
     async execute(context: OutputContext): Promise<void> {
       // Implementar lógica de exportação XML
       const xml = generateXml(context.tokens);
       const outPath = path.join(context.resultsDir, `${baseName}.tokens.xml`);
       await fs.writeFile(outPath, xml, 'utf8');
       
       if (context.errors.total > 0) {
         console.log(formatErrors(context.errors));
         process.exit(1);
       }
     }
   }
   ```

2. Exporte a nova estratégia em `src/output/index.ts`:
   ```typescript
   export * from './strategies/XmlOutputStrategy';
   ```

3. Adicione o tratamento da flag em `src/index.ts`:
   ```typescript
   const hasXmlFlag = argv.includes('--xml');
   // ...
   if (hasXmlFlag) {
     outputStrategy = new XmlOutputStrategy();
   }
   ```

#### Estender a gramática
- Palavras-chave: edite `src/languages/cpp/grammar/keywords.ts`.
- Pontuadores/operadores: edite `src/languages/cpp/grammar/punctuators.ts` (mantenha ordem do maior para o menor para priorizar operadores mais longos, ex.: `>>=` antes de `>>`).
- Novas regras no AFN: ajuste `src/languages/cpp/lexer/implementations/afn.ts` criando novas combinações em `buildAfn()` e definindo prioridade adequada no `combineAlternation`.
- Números avançados (floats/hex):
  - Manual: expanda o reconhecimento em `manual.ts` (loops/regex) e a atribuição de códigos.
  - AFN: crie novas regras com `charClass`, `literal`, `concatenate`, `alternate`, `plus`, `kleeneStar`.
- Categorias de token: se precisar de novos tipos além de `'operador'`, `'delimitador'` etc., atualize `TokenRow` e `CODE_BASE` em `src/languages/cpp/tokens/codes.ts` e ajuste os tokenizadores para emitir o novo tipo.

### Formato do token (TokenRow)
```ts
type TokenRow = {
  tipo:
    | 'palavra_reservada'
    | 'identificador'
    | 'delimitador'
    | 'operador'
    | 'numero'
    | 'string'
    | 'caractere';
  codigo: number;   // código sequencial por categoria (base em CODE_BASE)
  valor: string;    // lexema original
  linha: number;    // 1-based
  coluna: number;   // 1-based
}
```

### Sistema de Erros
O analisador coleta e reporta erros de todas as três fases:

#### Tipos de Erros Léxicos
- `caractere_invalido`: caracteres não reconhecidos pela gramática
- `string_nao_fechada`: strings que não foram terminadas
- `caractere_nao_fechado`: caracteres literais não fechados
- `comentario_nao_fechado`: comentários `/* */` não fechados
- `numero_invalido`: formato numérico inválido

#### Tipos de Erros Sintáticos
- `token_inesperado`: token encontrado onde outro era esperado
- `token_faltando`: token obrigatório não encontrado
- `expressao_incompleta`: expressão mal formada
- `declaracao_incompleta`: declaração incompleta
- `parentese_nao_fechado`: parênteses desbalanceados
- `chave_nao_fechada`: chaves desbalanceadas
- `colchete_nao_fechado`: colchetes desbalanceados

#### Tipos de Erros Semânticos
- `identificador_nao_declarado`: uso de variável/função não declarada
- `identificador_redeclarado`: redeclaração de identificador no mesmo escopo
- `tipo_incompativel`: tipos incompatíveis em atribuições/operações
- `funcao_nao_declarada`: chamada de função não declarada
- `parametros_incompatíveis`: argumentos incompatíveis com parâmetros
- `uso_invalido_tipo`: uso incorreto de tipo

#### Formato do Relatório de Erros
```
========== RELATÓRIO DE ERROS ==========
  linha:coluna → mensagem | contexto

[ANÁLISE LÉXICA] 1 erro(s)
  - 1:5     Caractere inválido: "@" | "@"

[ANÁLISE SINTÁTICA] 1 erro(s)
  - 2:3     Token inesperado | ")" (esperado=;; encontrado=))

[ANÁLISE SEMÂNTICA] 1 erro(s)
  - 3:7     Identificador "x" não foi declarado | "x" (identificador=x)

TOTAL GERAL: 3 erro(s)
```

### 📚 Documentação

- **[CONCEPTS.md](CONCEPTS.md)** - Guia conceitual: entenda como funciona um compilador
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detalhes técnicos: arquitetura, design patterns, implementação

### ⚡ Quick Start

```bash
# Instalar dependências
npm install

# Analisar arquivo C++ (modo console)
npm run dev -- samples/hello.cpp

# Exportar tokens para JSON
npm run dev -- --json samples/hello.cpp

# Usar tokenizador NFA (Thompson)
npm run dev -- --afn --json samples/hello.cpp

# Executar testes
npm test
```

### Conceitos principais
- **Tokenização léxica**: transformar texto em sequência de tokens significativos.
- **Análise sintática**: verificar estrutura sintática do código (parser recursivo descendente).
- **Análise semântica**: verificar regras de escopo, tipos e declarações.
- **Coleta centralizada de erros**: todas as fases reportam para um `ErrorCollector` único.
- **Longest-match e prioridade**: implementado no modo AFN.
- **Pipeline de pré-processamento**: remove BOM, faz line splicing e remove comentários, preservando offsets para cálculo de posição.

### O que já é suportado
- **Análise Léxica**:
  - Identificadores e palavras-chave (distinção por tabela de keywords).
  - Números inteiros (básico).
  - Strings ("") e caracteres ('') com escapes simples.
  - Delimitadores e operadores.
  - Posição de início (linha/coluna) de cada token.
  - Detecção de strings não fechadas, caracteres inválidos, etc.
- **Análise Sintática**:
  - Verificação de estrutura de declarações e expressões.
  - Detecção de parênteses/chaves/colchetes não fechados.
  - Verificação de tokens faltando ou inesperados.
- **Análise Semântica**:
  - Verificação de identificadores não declarados.
  - Detecção de redeclarações.
  - Verificação básica de escopo.
- **Saída (Strategy Pattern)**:
  - Tokens em JSON e CSV no diretório `results/`.
  - Tokens no console (formato tabular).
  - Relatório de erros formatado no console.
  - Estratégias intercambiáveis e extensíveis.

### Limitações atuais (podem ser estendidas)
- Números: não inclui floats, hex/bin/oct e sufixos.
- Pré-processador: diretivas (`#include`, `#define`) não são tokenizadas.
- Posições finais: não exporta linha/coluna de término (apenas início).
- Strings “raw” de C++ e casos avançados não cobertos.

### Roadmap sugerido
- Acrescentar floats, hex/bin/oct e sufixos a números.
- Diretivas de pré-processador como tokens.
- Posição final (linha/coluna de término) de cada token.
- Pipeline DFA opcional (AFN→DFA) para performance máxima.
- Análise semântica mais avançada (verificação de tipos, funções, etc.).
- Geração de código intermediário ou AST (Abstract Syntax Tree).

### Licença
ISC

