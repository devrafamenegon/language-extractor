# 🏗️ Arquitetura Técnica - Language Extractor

Este documento detalha a **arquitetura técnica** e **implementação** do projeto. Para conceitos teóricos, consulte **[CONCEPTS.md](CONCEPTS.md)**.

---

## 📖 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Estrutura de Diretórios](#estrutura-de-diretórios)
3. [Padrões de Design](#padrões-de-design)
4. [Implementação por Módulo](#implementação-por-módulo)
5. [Fluxo de Dados](#fluxo-de-dados)
6. [Sistema de Tipos](#sistema-de-tipos)
7. [Extensibilidade](#extensibilidade)

---

## Visão Geral da Arquitetura

### Princípios Arquiteturais

O projeto segue os princípios **SOLID** e utiliza **padrões de design** modernos:

```
┌──────────────────────────────────────────────────────┐
│                   CLI (src/index.ts)                  │
│              Ponto de entrada da aplicação            │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│              Compiler (Orquestrador)                  │
│         Coordena as 3 fases de compilação             │
└───┬──────────────┬──────────────┬────────────────────┘
    │              │              │
    ▼              ▼              ▼
┌─────────┐  ┌─────────┐  ┌──────────┐
│  Lexer  │  │ Parser  │  │ Semantic │  ← Stages (Fases)
│  Stage  │  │  Stage  │  │  Stage   │
└────┬────┘  └────┬────┘  └────┬─────┘
     │            │            │
     ▼            ▼            ▼
┌─────────┐  ┌─────────┐  ┌──────────┐
│ Lexer   │  │ Parser  │  │ Semantic │  ← Strategies
│Strategy │  │Strategy │  │ Strategy │     (Implementações)
└────┬────┘  └────┬────┘  └────┬─────┘
     │            │            │
     └────────────┴────────────┘
                  │
                  ▼
          ┌──────────────┐
          │ErrorCollector│  ← Sistema de erros centralizado
          └──────────────┘
                  │
                  ▼
          ┌──────────────┐
          │   Exporter   │  ← Strategy para exportação
          │   Strategy   │     (Console, JSON, CSV)
          └──────────────┘
```

### Separação de Responsabilidades

| Camada | Responsabilidade | Localização |
|--------|------------------|-------------|
| **CLI** | Interface com usuário, parsing de argumentos | `src/index.ts` |
| **Compiler** | Orquestração das fases | `src/compiler/Compiler.ts` |
| **Stages** | Execução de cada fase | `src/compiler/stages/` |
| **Strategies** | Implementações específicas | `src/language/cpp/` |
| **Error System** | Coleta e formatação de erros | `src/error/` |
| **Exporters** | Formatação de saída | `src/exporter/` |
| **Scanner** | Utilitários de scanning | `src/scanner/` |

---

## Estrutura de Diretórios

```
src/
├── index.ts                    # CLI principal
│
├── compiler/                   # Núcleo do compilador (genérico)
│   ├── Compiler.ts            # Orquestrador das 3 fases
│   ├── stages/                # Fases da compilação
│   │   ├── LexerStage.ts     # Fase léxica
│   │   ├── ParserStage.ts    # Fase sintática
│   │   └── SemanticStage.ts  # Fase semântica
│   ├── strategies/            # Interfaces de estratégias
│   │   ├── LexerStrategy.ts
│   │   ├── ParserStrategy.ts
│   │   └── SemanticStrategy.ts
│   └── types.ts               # Tipos genéricos
│
├── language/                   # Implementações específicas por linguagem
│   └── cpp/                   # Implementação para C++
│       ├── types.ts           # Tipos de erros específicos de C++
│       ├── consts/            # Constantes da linguagem
│       │   ├── codes.ts       # Códigos de tokens
│       │   ├── keywords.ts    # Palavras-chave
│       │   └── punctuators.ts # Pontuadores e operadores
│       ├── lexer/             # Análise léxica
│       │   ├── ManualLexer.ts           # Tokenização manual
│       │   ├── ManualLexerStrategy.ts   # Strategy wrapper
│       │   ├── AfnLexer.ts              # Tokenização por AFN
│       │   ├── AfnLexerStrategy.ts      # Strategy wrapper
│       │   └── LexicalErrorDetector.ts  # Detecção de erros
│       ├── parser/            # Análise sintática
│       │   ├── Parser.ts               # Parser recursivo
│       │   └── ParserStrategy.ts       # Strategy wrapper
│       └── semantic/          # Análise semântica
│           ├── SemanticAnalyzer.ts     # Análise semântica
│           └── SemanticStrategy.ts     # Strategy wrapper
│
├── error/                      # Sistema de erros
│   ├── ErrorCollector.ts      # Coletor centralizado
│   ├── formatter.ts           # Formatação de relatórios
│   └── types.ts               # Tipos de erros genéricos
│
├── exporter/                   # Exportação de resultados
│   ├── ExporterStrategy.ts    # Interface de estratégia
│   └── strategies/
│       ├── ConsoleExporter.ts # Saída para console
│       ├── JsonExporter.ts    # Saída JSON
│       └── CsvExporter.ts     # Saída CSV
│
├── scanner/                    # Utilitários de scanning
│   ├── position/              # Mapeamento de posições
│   │   └── lineMapping.ts     # Conversão índice→linha/coluna
│   ├── preprocessing/         # Pipeline de pré-processamento
│   │   ├── stripBOM.ts       # Remove BOM
│   │   ├── lineSplicing.ts   # Une linhas com \
│   │   └── stripComments.ts  # Remove comentários
│   └── nfa/                   # Autômatos Finitos
│       ├── types.ts          # Tipos do AFN
│       ├── builders.ts       # Construtores de Thompson
│       ├── helpers.ts        # Funções auxiliares (ε-closure, move)
│       └── NFAMatcher.ts     # Interface OOP para matching
│
└── utils/
    └── readTextFile.ts        # Leitura de arquivos

samples/                        # Arquivos de exemplo
├── hello.cpp
├── operators.cpp
└── mixed.cpp

results/                        # Saída gerada (JSON, CSV)
└── (arquivos gerados aqui)
```

---

## Padrões de Design

### 1. **Strategy Pattern** 🎯

Permite trocar implementações sem modificar o código cliente.

#### Aplicação: Tokenização

```typescript
// Interface da estratégia
interface LexerStrategy<T extends Token> {
  tokenize(sourceCode: string, errorCollector: ErrorCollector): T[];
}

// Estratégia 1: Manual
class ManualLexerStrategy implements LexerStrategy<TokenRow> {
  tokenize(sourceCode: string, errorCollector: ErrorCollector): TokenRow[] {
    return tokenize(sourceCode, errorCollector);
  }
}

// Estratégia 2: AFN
class AfnLexerStrategy implements LexerStrategy<TokenRow> {
  tokenize(sourceCode: string, errorCollector: ErrorCollector): TokenRow[] {
    return tokenizeAfn(sourceCode, errorCollector);
  }
}

// Cliente: não precisa saber qual estratégia está usando
class LexerStage<T extends Token> {
  constructor(private strategy: LexerStrategy<T>) {}
  
  execute(sourceCode: string): StageResult<T> {
    const errorCollector = new ErrorCollector();
    const tokens = this.strategy.tokenize(sourceCode, errorCollector);
    return { tokens, errors: errorCollector.getErrors().lexicos };
  }
}
```

**Vantagens:**
- Fácil adicionar novas estratégias (Regex, DFA, etc.)
- Código testável isoladamente
- Cliente desacoplado da implementação

#### Aplicação: Exportação

```typescript
interface ExporterStrategy {
  execute(context: ExportContext): Promise<void>;
}

// Estratégia: Console
class ConsoleExporter implements ExporterStrategy {
  async execute(context: ExportContext): Promise<void> {
    console.log('token, codigo, valor, linha, coluna');
    context.tokens.forEach(t => console.log(`${t.tipo}, ${t.codigo}, ...`));
  }
}

// Estratégia: JSON
class JsonExporter implements ExporterStrategy {
  async execute(context: ExportContext): Promise<void> {
    const json = JSON.stringify(context.tokens, null, 2);
    await fs.writeFile(`results/${basename}.tokens.json`, json);
  }
}
```

### 2. **Pipeline Pattern** 🔄

Processa dados através de uma sequência de transformações.

#### Aplicação: Pré-processamento

```typescript
type PreprocessStep = (input: string) => string;

function runPreprocessPipeline(
  source: string,
  steps: PreprocessStep[]
): string {
  return steps.reduce((text, step) => step(text), source);
}

// Uso
const preprocessed = runPreprocessPipeline(sourceCode, [
  stripBom,       // step 1: remove BOM
  lineSplicing,   // step 2: une linhas com \
  stripComments   // step 3: remove comentários
]);
```

**Vantagens:**
- Fácil adicionar/remover etapas
- Cada etapa é testável isoladamente
- Ordem das etapas é explícita

### 3. **Collector Pattern** 📦

Acumula informações durante um processo distribuído.

#### Aplicação: Sistema de Erros

```typescript
class ErrorCollector {
  private lexicos: LexicalError[] = [];
  private sintaticos: SyntacticError[] = [];
  private semanticos: SemanticError[] = [];

  addLexical(error: LexicalError): void {
    this.lexicos.push(error);
  }

  addSyntactic(error: SyntacticError): void {
    this.sintaticos.push(error);
  }

  addSemantic(error: SemanticError): void {
    this.semanticos.push(error);
  }

  getErrors(): ErrorCollection {
    return {
      lexicos: [...this.lexicos],
      sintaticos: [...this.sintaticos],
      semanticos: [...this.semanticos],
      total: this.lexicos.length + this.sintaticos.length + this.semanticos.length
    };
  }
}
```

**Vantagens:**
- Centralização de erros
- Fases independentes reportam ao mesmo coletor
- Fácil consultar erros de forma agregada

### 4. **Builder Pattern** (Thompson's Construction) 🏗️

Constrói objetos complexos passo a passo.

#### Aplicação: Construção de AFN

```typescript
// Primitivos
function literal(ch: string): Afn { ... }
function charClass(predicate: (ch: string) => boolean): Afn { ... }

// Combinadores
function concatenate(a: Afn, b: Afn): Afn { ... }
function alternate(a: Afn, b: Afn): Afn { ... }
function kleeneStar(a: Afn): Afn { ... }
function plus(a: Afn): Afn { ... }

// Uso: constrói AFN para identificadores
const letter = charClass(ch => /[A-Za-z_]/.test(ch));
const digit = charClass(ch => /[0-9]/.test(ch));
const letterOrDigit = alternate(letter, digit);
const identifier = concatenate(letter, kleeneStar(letterOrDigit));
```

**Vantagens:**
- Composição declarativa
- Reuso de componentes
- Fácil criar padrões complexos

### 5. **Facade Pattern** 🎭

Simplifica interface para subsistema complexo.

#### Aplicação: Compiler

```typescript
class Compiler<T extends Token> {
  constructor(
    private lexer: LexerStage<T>,
    private parser: ParserStage<T>,
    private semantic: SemanticStage<T>
  ) {}

  compile(sourceCode: string): CompilationResult<T> {
    // Esconde complexidade das 3 fases
    const lexResult = this.lexer.execute(sourceCode);
    const parseResult = this.parser.execute(lexResult.tokens);
    const semanticResult = this.semantic.execute(parseResult.tokens);
    
    return {
      tokens: semanticResult.tokens,
      errors: this.aggregateErrors(lexResult, parseResult, semanticResult)
    };
  }
}
```

**Vantagens:**
- Interface simples para cliente
- Encapsula coordenação complexa
- Cliente não precisa conhecer detalhes internos

---

## Implementação por Módulo

### Módulo: Compiler Core

#### `Compiler.ts` - Orquestrador Principal

```typescript
export class Compiler<T extends Token = Token> {
  private lexer: LexerStage<T>;
  private parser: ParserStage<T>;
  private semantic: SemanticStage<T>;

  constructor(
    lexer: LexerStage<T>,
    parser: ParserStage<T>,
    semantic: SemanticStage<T>
  ) {
    this.lexer = lexer;
    this.parser = parser;
    this.semantic = semantic;
  }

  compile(sourceCode: string): CompilationResult<T> {
    // 1. Análise Léxica
    const lexResult = this.lexer.execute(sourceCode);

    // 2. Análise Sintática (recebe tokens)
    const parseResult = this.parser.execute(lexResult.tokens);

    // 3. Análise Semântica (recebe tokens)
    const semanticResult = this.semantic.execute(parseResult.tokens);

    // 4. Agrega erros de todas as fases
    const errors = {
      lexicos: lexResult.errors,
      sintaticos: parseResult.errors,
      semanticos: semanticResult.errors,
      total: lexResult.errors.length + 
             parseResult.errors.length + 
             semanticResult.errors.length
    };

    return { tokens: semanticResult.tokens, errors };
  }
}
```

**Características:**
- **Genérico**: `<T extends Token>` permite qualquer tipo de token
- **Sequencial**: Executa fases na ordem correta
- **Agregador**: Coleta erros de todas as fases

#### `LexerStage.ts` - Fase Léxica

```typescript
export class LexerStage<T extends Token> {
  constructor(private strategy: LexerStrategy<T>) {}

  execute(sourceCode: string): StageResult<T> {
    const errorCollector = new ErrorCollector();
    const tokens = this.strategy.tokenize(sourceCode, errorCollector);
    
    return {
      tokens,
      errors: errorCollector.getErrors().lexicos
    };
  }
}
```

**Responsabilidades:**
1. Criar `ErrorCollector`
2. Delegar tokenização para strategy
3. Extrair erros léxicos
4. Retornar tokens + erros

### Módulo: Language C++

#### `ManualLexer.ts` - Tokenização Manual

**Estrutura Principal:**

```typescript
function* scanTokensOrdered(
  sourceCode: string,
  errorCollector?: ErrorCollector
): Generator<TokenRow> {
  // 1. Pré-processamento
  const preprocessed = runPreprocessPipeline(sourceCode, [
    stripBom,
    lineSplicing,
    stripComments
  ]);
  
  // 2. Mapeamento de linhas (para posições)
  const lineStarts = buildLineStartIndices(sourceCode);
  
  // 3. Detecção de erros pré-tokenização
  if (errorCollector) {
    detectUnclosedComments(sourceCode, lineStarts);
    detectUnclosedStrings(sourceCode, lineStarts, 0);
  }
  
  // 4. Loop principal de tokenização
  let i = 0;
  while (i < preprocessed.length) {
    const ch = preprocessed[i];
    
    // Ignora whitespace
    if (/\s/.test(ch)) { i++; continue; }
    
    // Reconhece números
    if (/[0-9]/.test(ch)) {
      yield tokenizeNumber(sourceCode, preprocessed, i, lineStarts);
      i = /* próxima posição */;
      continue;
    }
    
    // Reconhece identificadores/palavras-chave
    if (/[A-Za-z_]/.test(ch)) {
      yield tokenizeIdentifier(sourceCode, preprocessed, i, lineStarts);
      i = /* próxima posição */;
      continue;
    }
    
    // Reconhece strings/caracteres
    if (ch === '"' || ch === "'") {
      yield tokenizeString(sourceCode, preprocessed, i, lineStarts);
      i = /* próxima posição */;
      continue;
    }
    
    // Reconhece pontuadores/operadores
    const punctMatch = punctuatorRegex.exec(preprocessed);
    if (punctMatch) {
      yield tokenizePunctuator(sourceCode, punctMatch, i, lineStarts);
      i += punctMatch[0].length;
      continue;
    }
    
    // Caractere inválido
    if (errorCollector) {
      errorCollector.addLexical({
        tipo: 'caractere_invalido',
        mensagem: `Caractere inválido: "${ch}"`,
        linha: /* ... */,
        coluna: /* ... */
      });
    }
    i++;
  }
}
```

**Características:**
- **Generator**: `yield` retorna tokens um de cada vez
- **Duas passadas**: preprocessed para matching, sourceCode para lexemas
- **Posições preservadas**: `lineStarts` mapeia índices para linha/coluna

#### `AfnLexer.ts` - Tokenização por AFN

**Construção do AFN:**

```typescript
function buildAfn(): Map<Label, Afn> {
  // Whitespace: [ \t\n\r]+
  const ws = plus(charClass(ch => /\s/.test(ch)));
  
  // Número: [0-9]+
  const num = plus(charClass(ch => /[0-9]/.test(ch)));
  
  // Identificador: [A-Za-z_][A-Za-z0-9_]*
  const idStart = charClass(ch => /[A-Za-z_]/.test(ch));
  const idPart = charClass(ch => /[A-Za-z0-9_]/.test(ch));
  const id = concatenate(idStart, kleeneStar(idPart));
  
  // String: "([^"\\]|\\.)*"
  const str = buildStringAfn();
  
  // Operadores: cada um é um literal
  const operators = cppPunctuators.map(op => ({
    label: Label.PUNCT,
    afn: literal(op)
  }));
  
  return new Map([
    [Label.WS, ws],
    [Label.NUM, num],
    [Label.ID, id],
    [Label.STR, str],
    [Label.CHAR, buildCharAfn()],
    ...operators.map(o => [o.label, o.afn])
  ]);
}
```

**Matching:**

```typescript
function tokenizeOrderedAfn(
  sourceCode: string,
  errorCollector?: ErrorCollector
): TokenRow[] {
  const preprocessed = runPreprocessPipeline(sourceCode, [...]);
  const afns = buildAfn();
  const rules = Array.from(afns.entries()).map(([label, afn], priority) => ({
    label,
    afn,
    priority
  }));
  
  const combined = combineAlternation(rules);
  const tokens: TokenRow[] = [];
  
  let i = 0;
  while (i < preprocessed.length) {
    const result = matchLongest(combined, preprocessed, i);
    
    if (result) {
      const lexeme = sourceCode.slice(i, i + result.length);
      const { line, column } = indexToLineCol(lineStarts, i);
      
      if (result.label !== Label.WS) {
        tokens.push(createToken(result.label, lexeme, line, column));
      }
      
      i += result.length;
    } else {
      // Erro: nenhum match
      errorCollector?.addLexical({ /* ... */ });
      i++;
    }
  }
  
  return tokens;
}
```

**Características:**
- **Thompson's Construction**: AFN construído por composição
- **Longest-match**: Sempre escolhe o token mais longo
- **Prioridade**: Em empate, escolhe menor prioridade (definida na ordem)

#### `Parser.ts` - Análise Sintática

**Estrutura Principal:**

```typescript
class Parser {
  private tokens: TokenRow[];
  private current = 0;
  private errorCollector: ErrorCollector;

  parse(): void {
    while (!this.isAtEnd()) {
      this.declaration();
    }
    this.validateAllDelimiters();
  }

  // Recursão mútua para gramática
  private declaration(): void {
    if (this.match('palavra_reservada')) {
      this.handleTypeDeclaration();
    } else {
      this.expression();
    }
  }

  private expression(): void {
    this.equality();
  }

  private equality(): void {
    this.comparison();
    while (this.match('operador', '==') || this.match('operador', '!=')) {
      this.comparison();
    }
  }

  private comparison(): void {
    this.term();
    while (this.match('operador', '<') || this.match('operador', '>') ||
           this.match('operador', '<=') || this.match('operador', '>=')) {
      this.term();
    }
  }

  private term(): void {
    this.factor();
    while (this.match('operador', '+') || this.match('operador', '-')) {
      this.factor();
    }
  }

  private factor(): void {
    this.unary();
    while (this.match('operador', '*') || this.match('operador', '/')) {
      this.unary();
    }
  }

  private unary(): void {
    if (this.match('operador', '-') || this.match('operador', '!')) {
      this.unary();
    } else {
      this.primary();
    }
  }

  private primary(): void {
    if (this.matchAny(['numero', 'string', 'caractere', 'identificador'])) {
      return;
    }
    
    if (this.match('delimitador', '(')) {
      this.expression();
      this.expectDelimiter(')', 'parentese_nao_fechado', 'Parêntese não fechado');
      return;
    }
    
    this.reportUnexpectedToken();
  }

  // Validação de balanceamento
  private validateAllDelimiters(): void {
    const stack: DelimiterStack = [];
    
    this.tokens
      .filter(t => t.tipo === 'delimitador')
      .forEach(token => {
        if (['(', '{', '['].includes(token.valor)) {
          stack.push({ token, type: token.valor });
        } else if ([')', '}', ']'].includes(token.valor)) {
          if (stack.length === 0) {
            this.reportUnexpectedClosing(token);
          } else {
            const opening = stack.pop()!;
            const expected = DELIMITER_PAIRS[opening.type];
            if (token.valor !== expected) {
              this.reportMismatchedDelimiter(token, expected);
            }
          }
        }
      });
    
    // Delimitadores não fechados
    stack.forEach(({ token, type }) => {
      this.error(token, DELIMITER_ERROR_TYPES[type], `${type} não fechado`);
    });
  }

  // Utilitários
  private match(tipo: TokenRow['tipo'], valor?: string): boolean {
    if (this.check(tipo, valor)) {
      this.advance();
      return true;
    }
    return false;
  }

  private check(tipo: TokenRow['tipo'], valor?: string): boolean {
    if (this.isAtEnd()) return false;
    const token = this.tokens[this.current];
    if (token.tipo !== tipo) return false;
    if (valor !== undefined && token.valor !== valor) return false;
    return true;
  }

  private advance(): TokenRow {
    if (!this.isAtEnd()) this.current++;
    return this.previous()!;
  }

  private peek(): TokenRow | undefined {
    return this.tokens[this.current];
  }

  private previous(): TokenRow | undefined {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length;
  }

  private error(token: TokenRow, tipo: string, mensagem: string): void {
    this.errorCollector.addSyntactic({
      fase: 'sintatico',
      tipo,
      mensagem,
      linha: token.linha,
      coluna: token.coluna,
      trecho: token.valor
    });
  }
}
```

**Características:**
- **Recursivo descendente**: Cada regra gramatical é um método
- **LL(1)**: Lookahead de 1 token
- **Recuperação em pânico**: Continua após erro

#### `SemanticAnalyzer.ts` - Análise Semântica

**Estrutura Principal:**

```typescript
class SemanticAnalyzer {
  private tokens: TokenRow[];
  private errorCollector: ErrorCollector;
  private symbols = new Map<string, Symbol>();

  analyze(): void {
    this.processDeclarations();
    this.validateIdentifierUsage();
  }

  // Fase 1: Coleta declarações
  private processDeclarations(): void {
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      
      // Detecta declaração: tipo + identificador
      if (this.isTypeDeclaration(token)) {
        const idToken = this.tokens[i + 1];
        
        if (idToken?.tipo === 'identificador') {
          // Verifica redeclaração
          if (this.symbols.has(idToken.valor)) {
            const existing = this.symbols.get(idToken.valor)!;
            if (this.isInSameScope(existing.linha, idToken.linha)) {
              this.reportRedeclaration(idToken);
            }
          }
          
          // Adiciona à tabela
          this.symbols.set(idToken.valor, {
            nome: idToken.valor,
            tipo: this.isFunction(i + 1) ? 'funcao' : 'variavel',
            linha: idToken.linha,
            coluna: idToken.coluna
          });
        }
      }
    }
  }

  // Fase 2: Valida uso
  private validateIdentifierUsage(): void {
    const usedIdentifiers = this.collectUsedIdentifiers();
    
    usedIdentifiers.forEach(identifier => {
      if (!this.symbols.has(identifier) && !CPP_KEYWORDS.has(identifier)) {
        this.reportUndeclared(identifier);
      }
    });
  }

  private collectUsedIdentifiers(): Set<string> {
    return this.tokens
      .filter(t => t.tipo === 'identificador')
      .filter((t, i) => !this.isPartOfDeclaration(i))
      .reduce((set, t) => set.add(t.valor), new Set<string>());
  }

  private isPartOfDeclaration(index: number): boolean {
    const prev = this.findPreviousSignificantToken(index);
    return prev?.tipo === 'palavra_reservada' && TYPE_KEYWORDS.has(prev.valor);
  }

  private isInSameScope(line1: number, line2: number): boolean {
    return Math.abs(line1 - line2) < SCOPE_PROXIMITY_THRESHOLD;
  }
}
```

**Características:**
- **Duas passadas**: 
  1. Coleta declarações
  2. Valida uso
- **Tabela de símbolos**: `Map<string, Symbol>`
- **Escopo simplificado**: Por proximidade de linhas (threshold = 10)

### Módulo: Error System

#### `ErrorCollector.ts` - Coletor Centralizado

```typescript
export class ErrorCollector {
  private lexicos: LexicalError[] = [];
  private sintaticos: SyntacticError[] = [];
  private semanticos: SemanticError[] = [];

  addLexical(error: LexicalError): void {
    this.lexicos.push(error);
  }

  addSyntactic(error: SyntacticError): void {
    this.sintaticos.push(error);
  }

  addSemantic(error: SemanticError): void {
    this.semanticos.push(error);
  }

  getErrors(): ErrorCollection {
    return {
      lexicos: [...this.lexicos],
      sintaticos: [...this.sintaticos],
      semanticos: [...this.semanticos],
      total: this.lexicos.length + this.sintaticos.length + this.semanticos.length
    };
  }

  hasErrors(): boolean {
    return this.total > 0;
  }

  clear(): void {
    this.lexicos = [];
    this.sintaticos = [];
    this.semanticos = [];
  }
}
```

#### `formatter.ts` - Formatação de Relatórios

```typescript
export function formatErrors(errors: ErrorCollection): string {
  const lines: string[] = [];
  
  lines.push('========== RELATÓRIO DE ERROS ==========');
  lines.push('  linha:coluna → mensagem | contexto');
  lines.push('');
  
  // Erros léxicos
  if (errors.lexicos.length > 0) {
    lines.push(`[ANÁLISE LÉXICA] ${errors.lexicos.length} erro(s)`);
    errors.lexicos.forEach(e => {
      lines.push(`  - ${e.linha}:${e.coluna}    ${e.mensagem} | ${e.trecho}`);
    });
    lines.push('');
  }
  
  // Erros sintáticos
  if (errors.sintaticos.length > 0) {
    lines.push(`[ANÁLISE SINTÁTICA] ${errors.sintaticos.length} erro(s)`);
    errors.sintaticos.forEach(e => {
      let detail = `${e.trecho}`;
      if (e.esperado) detail += ` (esperado=${e.esperado}`;
      if (e.encontrado) detail += `; encontrado=${e.encontrado})`;
      lines.push(`  - ${e.linha}:${e.coluna}    ${e.mensagem} | ${detail}`);
    });
    lines.push('');
  }
  
  // Erros semânticos
  if (errors.semanticos.length > 0) {
    lines.push(`[ANÁLISE SEMÂNTICA] ${errors.semanticos.length} erro(s)`);
    errors.semanticos.forEach(e => {
      let detail = `${e.trecho}`;
      if (e.identificador) detail += ` (identificador=${e.identificador})`;
      lines.push(`  - ${e.linha}:${e.coluna}    ${e.mensagem} | ${detail}`);
    });
    lines.push('');
  }
  
  lines.push(`TOTAL GERAL: ${errors.total} erro(s)`);
  
  return lines.join('\n');
}
```

### Módulo: Scanner Utilities

#### `position/lineMapping.ts` - Mapeamento de Posições

```typescript
/**
 * Constrói índice de inícios de linha.
 * Permite conversão rápida índice→(linha,coluna).
 */
export function buildLineStartIndices(text: string): number[] {
  const indices: number[] = [0];  // linha 1 começa no índice 0
  
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n') {
      indices.push(i + 1);  // próxima linha começa após \n
    }
  }
  
  return indices;
}

/**
 * Converte índice absoluto para (linha, coluna) 1-based.
 */
export function indexToLineCol(
  lineStarts: number[],
  index: number
): { line: number; column: number } {
  // Busca binária para encontrar linha
  let line = 0;
  for (let i = lineStarts.length - 1; i >= 0; i--) {
    if (index >= lineStarts[i]) {
      line = i;
      break;
    }
  }
  
  const column = index - lineStarts[line];
  
  return {
    line: line + 1,      // 1-based
    column: column + 1   // 1-based
  };
}
```

**Complexidade:**
- `buildLineStartIndices`: O(n) onde n = tamanho do texto
- `indexToLineCol`: O(m) onde m = número de linhas

**Otimização possível:**
- Busca binária em `indexToLineCol` → O(log m)

#### `nfa/builders.ts` - Thompson's Construction

```typescript
/**
 * Literal: reconhece caractere exato.
 */
export function literal(ch: string): Afn {
  const start = new AfnState();
  const end = new AfnState();
  
  start.transitions.push({
    test: (c: string) => c === ch,
    to: end
  });
  
  return { start, end };
}

/**
 * Concatenação: a seguido de b.
 */
export function concatenate(a: Afn, b: Afn): Afn {
  // Liga final de 'a' ao início de 'b' com ε
  a.end.epsilon.push(b.start);
  
  return { start: a.start, end: b.end };
}

/**
 * Alternação: a | b.
 */
export function alternate(a: Afn, b: Afn): Afn {
  const start = new AfnState();
  const end = new AfnState();
  
  // ε do início para ambos
  start.epsilon.push(a.start, b.start);
  
  // ε de ambos para o fim
  a.end.epsilon.push(end);
  b.end.epsilon.push(end);
  
  return { start, end };
}

/**
 * Kleene Star: a*.
 */
export function kleeneStar(a: Afn): Afn {
  const start = new AfnState();
  const end = new AfnState();
  
  // ε do início para a.start e para o fim (zero ocorrências)
  start.epsilon.push(a.start, end);
  
  // ε de a.end para a.start (repetir) e para o fim
  a.end.epsilon.push(a.start, end);
  
  return { start, end };
}

/**
 * Plus: a+ (uma ou mais).
 */
export function plus(a: Afn): Afn {
  const start = new AfnState();
  const end = new AfnState();
  
  // ε do início para a.start
  start.epsilon.push(a.start);
  
  // ε de a.end para a.start (repetir) e para o fim
  a.end.epsilon.push(a.start, end);
  
  return { start, end };
}
```

#### `nfa/helpers.ts` - Operações de AFN

```typescript
/**
 * ε-closure: fecha conjunto de estados por transições epsilon.
 */
export function epsilonClosure(states: Set<AfnState>): Set<AfnState> {
  const stack: AfnState[] = [...states];
  const visited = new Set<AfnState>(states);
  
  while (stack.length > 0) {
    const state = stack.pop()!;
    
    for (const nextState of state.epsilon) {
      if (!visited.has(nextState)) {
        visited.add(nextState);
        stack.push(nextState);
      }
    }
  }
  
  return visited;
}

/**
 * move: aplica transições condicionais consumindo um caractere.
 */
export function move(states: Set<AfnState>, ch: string): Set<AfnState> {
  const result = new Set<AfnState>();
  
  for (const state of states) {
    for (const transition of state.transitions) {
      if (transition.test(ch)) {
        result.add(transition.to);
      }
    }
  }
  
  return result;
}

/**
 * matchLongest: encontra o match mais longo a partir de uma posição.
 */
export function matchLongest(
  afn: Afn,
  text: string,
  startIndex: number
): { length: number; label: string } | null {
  let currentStates = epsilonClosure(new Set([afn.start]));
  let lastAcceptLength = -1;
  let lastAcceptLabel = '';
  
  for (let i = startIndex; i < text.length; i++) {
    const ch = text[i];
    
    // Aplica transições
    const nextStates = epsilonClosure(move(currentStates, ch));
    
    if (nextStates.size === 0) {
      // Nenhum próximo estado → para
      break;
    }
    
    // Verifica se algum estado atual é aceitador
    for (const state of nextStates) {
      if (state.label) {
        lastAcceptLength = i - startIndex + 1;
        lastAcceptLabel = state.label;
      }
    }
    
    currentStates = nextStates;
  }
  
  if (lastAcceptLength > 0) {
    return { length: lastAcceptLength, label: lastAcceptLabel };
  }
  
  return null;
}
```

---

## Fluxo de Dados

### 1. Entrada → Compilação

```
Código Fonte (string)
         │
         ▼
    Compiler.compile()
         │
         ├─→ LexerStage.execute()
         │        │
         │        ├─→ LexerStrategy.tokenize()
         │        │        │
         │        │        ├─→ runPreprocessPipeline()
         │        │        ├─→ detectErrors()
         │        │        └─→ scanTokens()
         │        │
         │        └─→ ErrorCollector (erros léxicos)
         │
         ├─→ ParserStage.execute()
         │        │
         │        ├─→ ParserStrategy.parse()
         │        │        │
         │        │        ├─→ recursiveDescent()
         │        │        └─→ validateDelimiters()
         │        │
         │        └─→ ErrorCollector (erros sintáticos)
         │
         └─→ SemanticStage.execute()
                  │
                  ├─→ SemanticStrategy.analyze()
                  │        │
                  │        ├─→ processDeclarations()
                  │        └─→ validateUsage()
                  │
                  └─→ ErrorCollector (erros semânticos)
         
Tokens + ErrorCollection
         │
         ▼
    ExporterStrategy.execute()
         │
         ├─→ ConsoleExporter (stdout)
         ├─→ JsonExporter (results/*.json)
         └─→ CsvExporter (results/*.csv)
```

### 2. Dados Intermediários

| Fase | Entrada | Saída | Estruturas Auxiliares |
|------|---------|-------|----------------------|
| **Pré-processamento** | `string` (código) | `string` (preprocessed) | - |
| **Lexer** | `string` (preprocessed) | `TokenRow[]` | `lineStarts: number[]` |
| **Parser** | `TokenRow[]` | `TokenRow[]` (inalterado) | `stack: DelimiterStack` |
| **Semantic** | `TokenRow[]` | `TokenRow[]` (inalterado) | `symbols: Map<string, Symbol>` |
| **Error Aggregation** | 3 × `Error[]` | `ErrorCollection` | - |
| **Export** | `TokenRow[]` + `ErrorCollection` | `void` (efeitos colaterais) | - |

---

## Sistema de Tipos

### Hierarquia de Tipos

```typescript
// Token genérico (interface base)
interface Token {
  tipo: string;
  codigo: number;
  valor: string;
  linha: number;
  coluna: number;
}

// Token específico de C++
type TokenRow = {
  tipo: 'palavra_reservada' | 'identificador' | 'delimitador' | 
        'operador' | 'numero' | 'string' | 'caractere';
  codigo: number;
  valor: string;
  linha: number;
  coluna: number;
}

// Erros (hierarquia)
interface AnalysisError {
  fase: string;
  mensagem: string;
  linha: number;
  coluna: number;
  trecho?: string;
}

interface LexicalError extends AnalysisError {
  fase: 'lexico';
  tipo: 'caractere_invalido' | 'string_nao_fechada' | 
        'caractere_nao_fechado' | 'comentario_nao_fechado' | 
        'numero_invalido';
}

interface SyntacticError extends AnalysisError {
  fase: 'sintatico';
  tipo: string;
  esperado?: string;
  encontrado?: string;
}

interface SemanticError extends AnalysisError {
  fase: 'semantico';
  tipo: string;
  identificador?: string;
}

// Coleção de erros
interface ErrorCollection {
  lexicos: LexicalError[];
  sintaticos: SyntacticError[];
  semanticos: SemanticError[];
  total: number;
}

// Resultado de compilação
interface CompilationResult<T extends Token> {
  tokens: T[];
  errors: ErrorCollection;
}
```

### Genéricos e Polimorfismo

```typescript
// Compiler é genérico no tipo de token
class Compiler<T extends Token = Token> {
  compile(sourceCode: string): CompilationResult<T> { ... }
}

// Stages são genéricas
class LexerStage<T extends Token> {
  execute(sourceCode: string): StageResult<T> { ... }
}

// Strategies são genéricas
interface LexerStrategy<T extends Token> {
  tokenize(sourceCode: string, errorCollector: ErrorCollector): T[];
}

// Uso concreto
const lexerStrategy: LexerStrategy<TokenRow> = new ManualLexerStrategy();
const lexer = new LexerStage<TokenRow>(lexerStrategy);
const compiler = new Compiler<TokenRow>(lexer, parser, semantic);
```

**Vantagens:**
- Reutilizável para outras linguagens
- Type-safe em TypeScript
- Fácil estender com novos tipos de token

---

## Extensibilidade

### Como Adicionar Nova Linguagem

**1. Defina o tipo de token:**

```typescript
// src/language/python/consts/codes.ts
type PythonToken = {
  tipo: 'keyword' | 'identifier' | 'indent' | 'dedent' | 
        'operator' | 'number' | 'string';
  codigo: number;
  valor: string;
  linha: number;
  coluna: number;
}
```

**2. Implemente as strategies:**

```typescript
// src/language/python/lexer/PythonLexerStrategy.ts
class PythonLexerStrategy implements LexerStrategy<PythonToken> {
  tokenize(sourceCode: string, errorCollector: ErrorCollector): PythonToken[] {
    // Implementação específica para Python
    // - Indentação é significativa
    // - Sem delimitadores { }
    return tokens;
  }
}

// src/language/python/parser/PythonParserStrategy.ts
class PythonParserStrategy implements ParserStrategy<PythonToken> {
  parse(tokens: PythonToken[], errorCollector: ErrorCollector): void {
    // Parser específico para Python
  }
}

// src/language/python/semantic/PythonSemanticStrategy.ts
class PythonSemanticStrategy implements SemanticStrategy<PythonToken> {
  analyze(tokens: PythonToken[], errorCollector: ErrorCollector): void {
    // Análise semântica Python
  }
}
```

**3. Configure o compiler:**

```typescript
// src/index.ts
const pythonLexer = new LexerStage(new PythonLexerStrategy());
const pythonParser = new ParserStage(new PythonParserStrategy());
const pythonSemantic = new SemanticStage(new PythonSemanticStrategy());

const pythonCompiler = new Compiler(pythonLexer, pythonParser, pythonSemantic);

const result = pythonCompiler.compile(pythonCode);
```

### Como Adicionar Nova Estratégia de Tokenização

**Exemplo: Tokenizador baseado em DFA**

```typescript
// src/language/cpp/lexer/DfaLexer.ts
export function tokenizeDfa(
  sourceCode: string,
  errorCollector: ErrorCollector
): TokenRow[] {
  // 1. Converte AFN para DFA (subset construction)
  const afn = buildAfn();
  const dfa = afnToDfa(afn);
  
  // 2. Tokeniza usando DFA (mais eficiente)
  const tokens: TokenRow[] = [];
  let i = 0;
  
  while (i < sourceCode.length) {
    const result = matchDfa(dfa, sourceCode, i);
    if (result) {
      tokens.push(createToken(result));
      i += result.length;
    } else {
      errorCollector.addLexical({ /* erro */ });
      i++;
    }
  }
  
  return tokens;
}

// src/language/cpp/lexer/DfaLexerStrategy.ts
export class DfaLexerStrategy implements LexerStrategy<TokenRow> {
  tokenize(sourceCode: string, errorCollector: ErrorCollector): TokenRow[] {
    return tokenizeDfa(sourceCode, errorCollector);
  }
}
```

**Uso:**

```typescript
const dfaStrategy = new DfaLexerStrategy();
const lexer = new LexerStage(dfaStrategy);
```

### Como Adicionar Novo Formato de Exportação

**Exemplo: Exportador XML**

```typescript
// src/exporter/strategies/XmlExporter.ts
export class XmlExporter implements ExporterStrategy {
  async execute(context: ExportContext): Promise<void> {
    const xml = this.generateXml(context.tokens);
    const baseName = path.basename(context.filePath, path.extname(context.filePath));
    const outputPath = path.join(context.resultsDir, `${baseName}.tokens.xml`);
    
    await fs.writeFile(outputPath, xml, 'utf8');
    console.log(`✅ XML salvo em: ${outputPath}`);
    
    if (context.errors.total > 0) {
      console.log(formatErrors(context.errors));
      process.exit(1);
    }
  }

  private generateXml(tokens: TokenRow[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<tokens>\n';
    
    tokens.forEach(token => {
      xml += '  <token>\n';
      xml += `    <tipo>${token.tipo}</tipo>\n`;
      xml += `    <codigo>${token.codigo}</codigo>\n`;
      xml += `    <valor>${this.escapeXml(token.valor)}</valor>\n`;
      xml += `    <linha>${token.linha}</linha>\n`;
      xml += `    <coluna>${token.coluna}</coluna>\n`;
      xml += '  </token>\n';
    });
    
    xml += '</tokens>';
    return xml;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
```

**Integração na CLI:**

```typescript
// src/index.ts
const hasXmlFlag = argv.includes('--xml');

let exporter: ExporterStrategy = new ConsoleExporter();
if (hasJsonFlag) exporter = new JsonExporter();
if (hasCsvFlag) exporter = new CsvExporter();
if (hasXmlFlag) exporter = new XmlExporter();  // ← Nova estratégia

await exporter.execute({ tokens, errors, filePath, resultsDir });
```

---

## Performance e Otimizações

### Complexidades Algorítmicas

| Operação | Complexidade | Notas |
|----------|-------------|-------|
| `buildLineStartIndices` | O(n) | n = tamanho do código |
| `indexToLineCol` | O(m) | m = número de linhas |
| `stripComments` | O(n) | Percorre todo o texto |
| **Tokenização Manual** | O(n) | Um passe pelo texto |
| **Tokenização AFN** | O(n × k × s) | k = tamanho do padrão, s = estados do AFN |
| **Parsing** | O(n) | n = número de tokens (LL(1)) |
| **Análise Semântica** | O(n + m) | n = tokens, m = símbolos |

### Possíveis Otimizações

**1. DFA em vez de AFN**
```
AFN: O(n × s) estados ativos simultâneos
DFA: O(n) um estado ativo por vez

Tradeoff: DFA usa mais memória (explosão de estados)
```

**2. Busca Binária em `indexToLineCol`**
```typescript
export function indexToLineCol(lineStarts: number[], index: number) {
  // Busca binária: O(log m) em vez de O(m)
  let left = 0;
  let right = lineStarts.length - 1;
  
  while (left < right) {
    const mid = Math.floor((left + right + 1) / 2);
    if (lineStarts[mid] <= index) {
      left = mid;
    } else {
      right = mid - 1;
    }
  }
  
  const line = left;
  const column = index - lineStarts[line];
  return { line: line + 1, column: column + 1 };
}
```

**3. Memoização de Tokens**
```typescript
// Cache de tokens por hash do código
const tokenCache = new Map<string, TokenRow[]>();

function tokenizeWithCache(sourceCode: string): TokenRow[] {
  const hash = crypto.createHash('md5').update(sourceCode).digest('hex');
  
  if (tokenCache.has(hash)) {
    return tokenCache.get(hash)!;
  }
  
  const tokens = tokenize(sourceCode);
  tokenCache.set(hash, tokens);
  return tokens;
}
```

---

## Testes

### Estrutura de Testes

```
tests/
├── compiler/
│   ├── Compiler.test.ts          # Testes de integração
│   └── stages/
│       ├── LexerStage.test.ts
│       ├── ParserStage.test.ts
│       └── SemanticStage.test.ts
├── language/
│   └── cpp/
│       ├── lexer/
│       │   ├── ManualLexer.test.ts
│       │   ├── AfnLexer.test.ts
│       │   └── LexicalErrorDetector.test.ts
│       ├── parser/
│       │   └── Parser.test.ts
│       └── semantic/
│           └── SemanticAnalyzer.test.ts
├── scanner/
│   ├── nfa/
│   │   ├── builders.test.ts
│   │   └── helpers.test.ts
│   ├── position/
│   │   └── lineMapping.test.ts
│   └── preprocessing/
│       ├── stripBOM.test.ts
│       ├── lineSplicing.test.ts
│       └── stripComments.test.ts
└── error/
    ├── ErrorCollector.test.ts
    └── formatter.test.ts
```

### Exemplo de Teste

```typescript
// tests/language/cpp/lexer/ManualLexer.test.ts
import { describe, it, expect } from 'vitest';
import { tokenize } from '@/language/cpp/lexer/ManualLexer';
import { ErrorCollector } from '@/error';

describe('ManualLexer', () => {
  it('tokeniza declaração simples', () => {
    const code = 'int x = 42;';
    const tokens = tokenize(code);
    
    expect(tokens).toHaveLength(5);
    expect(tokens[0]).toMatchObject({
      tipo: 'palavra_reservada',
      valor: 'int',
      linha: 1,
      coluna: 1
    });
    expect(tokens[1]).toMatchObject({
      tipo: 'identificador',
      valor: 'x'
    });
  });

  it('detecta string não fechada', () => {
    const code = 'int x = "unclosed;';
    const errorCollector = new ErrorCollector();
    tokenize(code, errorCollector);
    
    const errors = errorCollector.getErrors();
    expect(errors.lexicos).toHaveLength(1);
    expect(errors.lexicos[0].tipo).toBe('string_nao_fechada');
  });

  it('distingue palavras-chave de identificadores', () => {
    const code = 'int inteiro;';
    const tokens = tokenize(code);
    
    expect(tokens[0].tipo).toBe('palavra_reservada');  // 'int'
    expect(tokens[1].tipo).toBe('identificador');      // 'inteiro'
  });
});
```

---

## Conclusão

Este documento descreveu a **arquitetura técnica completa** do Language Extractor:

✅ **Padrões de Design**: Strategy, Pipeline, Collector, Builder, Facade  
✅ **Estrutura Modular**: Separação clara de responsabilidades  
✅ **Sistema de Tipos**: Genéricos e type-safe  
✅ **Extensibilidade**: Fácil adicionar novas linguagens e formatos  
✅ **Performance**: Complexidades algorítmicas otimizadas  
✅ **Testabilidade**: Estrutura bem definida de testes  

Para entender os **conceitos teóricos**, consulte **[CONCEPTS.md](CONCEPTS.md)**.

---

## Referências Técnicas

- **Design Patterns**: Gang of Four (GoF) - Strategy, Builder, Facade, Collector
- **Thompson's Construction**: "Regular Expression Search Algorithm" - Ken Thompson (1968)
- **TypeScript**: https://www.typescriptlang.org/docs/
- **SOLID Principles**: Robert C. Martin
- **Clean Architecture**: Robert C. Martin
