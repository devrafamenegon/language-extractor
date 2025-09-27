## Language Extractor (Analisador Léxico C/C++)

Projeto didático e prático de analisador léxico para C/C++, com duas implementações de tokenizer:
- Tokenizer manual (regex/loops)
- Tokenizer por AFN (Autômato Finito Não-determinístico)

Exporta tokens em JSON e CSV, com posição de início (linha/coluna) por token. Os arquivos são salvos no diretório `results/`.

### Requisitos
- Node.js 18+

### Instalação
```bash
npm install
```

### Scripts
- `npm run dev` – executa a CLI com tsx (hot reload)
- `npm run build` – compila TypeScript para `dist/`
- `npm start` – executa `dist/index.js` (requer build prévio)

### Uso da CLI
```bash
# Modo padrão: imprime tokens no console (inclui linha/coluna)
npm run dev -- samples/hello.cpp

# JSON: salva em results/<arquivo>.tokens.json
npm run dev -- --json samples/hello.cpp

# CSV: salva em results/<arquivo>.tokens.csv
npm run dev -- --csv samples/hello.cpp

# Usar o tokenizador por AFN (combinável com --json/--csv)
npm run dev -- --afn --json samples/hello.cpp
npm run dev -- --afn --csv samples/hello.cpp

# Execução após build (equivalente ao dev, mas com dist/)
npm run build && npm start -- --json samples/hello.cpp
```

Saídas de exemplo geradas neste repositório ficam em `results/` (ex.: `hello.tokens.json`, `mixed.tokens.csv`).

### Fluxo ponta a ponta
1. Leitura do arquivo: a CLI resolve o caminho informado e lê o conteúdo como UTF-8 (`src/utils/readTextFile.ts`).
2. Pré-processamento: aplica a pipeline em `src/lex/preprocess/index.ts` na ordem: `stripBOM` → `lineSplicing` → `stripComments`. O texto preprocessado é usado apenas para casar tokens, mas os lexemas e posições são extraídos do texto original, preservando offsets corretos.
3. Escolha do tokenizer: por padrão usa o tokenizador manual; com `--afn` usa o tokenizador por AFN.
4. Tokenização: gera uma sequência ordenada de `TokenRow`, cada um com tipo, código, valor e posição de início (linha/coluna 1-based).
5. Saída:
   - Sem flags: imprime em stdout com cabeçalho.
   - `--json`: grava `results/<base>.tokens.json` identado (2 espaços).
   - `--csv`: grava `results/<base>.tokens.csv` com valores entre aspas e `"` escapado como `""`.
6. Tratamento de erros: se o arquivo não for informado ou não puder ser lido, a CLI escreve uma mensagem de erro e encerra com código 1.

### Pré-processamento (preserva posições)
- `stripBOM`: remove o BOM inicial, se presente.
- `lineSplicing`: concatena linhas terminadas com `\\\n`, espelhando o pré-processador de C/C++.
- `stripComments`: remove comentários `//` e `/* ... */` mantendo o comprimento, para que os índices absolutos do texto original não mudem. Assim, mesmo casando no texto preprocessado, o lexema e a posição são obtidos do original.

### Tokenização manual (`src/languages/cpp/tokenize/manual.ts`)
- Estratégia: varredura com loops/regex para números, identificadores/palavras-chave, strings/chars e pontuadores/operadores.
- Palavras-chave: são reconhecidas comparando com `cppKeywordSet`.
- Pontuadores/operadores: casados por regex construída a partir de `punctuators` (ordem longa-primeiro).
- Códigos: por tipo, começando em `CODE_BASE` (ex.: identificadores a partir de 201). O mesmo lexema por tipo mantém o mesmo código.
- Posição: mapeada via `buildLineStartIndices` e `indexToLineCol` a partir do índice absoluto no texto original.

### Tokenização por AFN (`src/languages/cpp/tokenize/afn.ts`)
- Construção: usa combinadores de Thompson em `src/lex/afn` para compor regras rotuladas (WS, número, identificador, strings, pontuadores) com prioridade.
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
# Tokens no console
npm run dev -- samples/hello.cpp

# Gera JSON e CSV para o mesmo arquivo (em results/)
npm run dev -- --json samples/mixed.cpp
npm run dev -- --csv  samples/mixed.cpp

# AFN + JSON
npm run dev -- --afn --json samples/operators.cpp
```

### Como estender
- Palavras-chave: edite `src/languages/cpp/grammar/keywords.ts`.
- Pontuadores/operadores: edite `src/languages/cpp/grammar/punctuators.ts` (mantenha ordem do maior para o menor para priorizar operadores mais longos, ex.: `>>=` antes de `>>`).
- Novas regras no AFN: ajuste `src/languages/cpp/tokenize/afn.ts` criando novas combinações em `buildAfn()` e definindo prioridade adequada no `combineAlternation`.
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

### Arquitetura
- `src/index.ts`: CLI – leitura do arquivo, seleção do tokenizer (manual/AFN) e saída (console/JSON/CSV).
- `src/languages/cpp/tokenize/manual.ts`: tokenizador manual por regex/loops.
- `src/languages/cpp/tokenize/afn.ts`: tokenizador via AFN (construções de Thompson), longest-match e prioridade de regra.
- `src/lex/afn/{builders.ts,helpers.ts,types.ts}`: primitivas e helpers do AFN.
- `src/languages/cpp/tokens/codes.ts`: tipo `TokenRow` e códigos base por categoria.
- `src/languages/cpp/grammar/{keywords.ts,punctuators.ts}`: palavras-chave e pontuadores/operadores C++ (ordem longa-primeiro).
- `src/lex/position/lineIndex.ts`: mapeia índice absoluto em (linha, coluna).
- `src/lex/preprocess/{stripBOM.ts,lineSplicing.ts,stripComments.ts,index.ts}`: pipeline de pré-processamento.
- `src/utils/readTextFile.ts`: leitura assíncrona de arquivo UTF-8.

### Conceitos principais
- Tokenização léxica: transformar texto em sequência de tokens significativos.
- Longest-match e prioridade (implementado no modo AFN).
- Pipeline de pré-processamento: remove BOM, faz line splicing e remove comentários, preservando offsets para cálculo de posição.

### O que já é suportado
- Identificadores e palavras-chave (distinção por tabela de keywords).
- Números inteiros (básico).
- Strings ("") e caracteres ('') com escapes simples.
- Delimitadores e operadores (um único tipo `operador`).
- Posição de início (linha/coluna) de cada token.
- Saída JSON e CSV no diretório `results/`.

### Limitações atuais (podem ser estendidas)
- Números: não inclui floats, hex/bin/oct e sufixos.
- Pré-processador: diretivas (`#include`, `#define`) não são tokenizadas.
- Posições finais: não exporta linha/coluna de término (apenas início).
- Strings “raw” de C++ e casos avançados não cobertos.

### Roadmap sugerido
- Acrescentar floats, hex/bin/oct e sufixos a números.
- Token de erro com mensagem/posição para caracteres inválidos.
- Diretivas de pré-processador como tokens.
- Posição final (linha/coluna de término) de cada token.
- Pipeline DFA opcional (AFN→DFA) para performance máxima.

### Licença
ISC

