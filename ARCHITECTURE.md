# 📚 Arquitetura do Language Extractor

> **Compilador educacional para C++ com análise léxica, sintática e semântica.**

---

## 📖 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura](#-arquitetura)
3. [Design Patterns](#-design-patterns)
4. [Fluxo de Compilação](#-fluxo-de-compilação)
5. [Coleta de Erros](#-coleta-de-erros)
6. [Módulos Principais](#-módulos-principais)
7. [Exportação de Dados](#-exportação-de-dados)
8. [Filosofia de Design](#-filosofia-de-design)

---

## 🎯 Visão Geral

### Propósito

O **Language Extractor** é um compilador front-end educacional que realiza análise completa de código C++, incluindo:

- **Análise Léxica**: Tokenização do código-fonte
- **Análise Sintática**: Verificação de estrutura gramatical
- **Análise Semântica**: Validação de tipos, escopos e declarações
- **Coleta de Erros**: Sistema unificado de detecção e reporte de erros
- **Exportação**: Saída em múltiplos formatos (Console, JSON, CSV)

### Princípios de Design

1. **Clean Code**: Código legível, simples e bem organizado
2. **KISS (Keep It Simple, Stupid)**: Evita complexidade desnecessária
3. **YAGNI (You Aren't Gonna Need It)**: Implementa apenas o necessário
4. **SOLID**: Princípios de design orientado a objetos
5. **Design Patterns**: Uso estratégico de padrões clássicos

---

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
language-extractor/
├── src/
│   ├── compiler/              # Orquestração da compilação
│   │   ├── Compiler.ts        # Pipeline principal
│   │   └── stages/            # Fases de análise
│   │       ├── LexerStage.ts
│   │       ├── ParserStage.ts
│   │       └── SemanticStage.ts
│   │
│   ├── scanning/              # Infraestrutura de varredura
│   │   ├── nfa/               # Autômatos finitos
│   │   ├── preprocessing/     # Pré-processamento
│   │   ├── line-mapping/      # Mapeamento de posições
│   │   └── ScanningPipeline.ts
│   │
│   ├── languages/             # Domínio específico de linguagem
│   │   └── cpp/               # Implementação C++
│   │       ├── lexer/         # Análise léxica
│   │       ├── parser/        # Análise sintática
│   │       ├── semantic/      # Análise semântica
│   │       ├── grammar/       # Definições da gramática
│   │       ├── tokens/        # Tipos de tokens
│   │       └── errors/        # Detecção de erros
│   │
│   ├── errors/                # Sistema de erros
│   │   ├── ErrorTypes.ts      # Tipos genéricos
│   │   └── ErrorCollector.ts  # Coletor unificado
│   │
│   ├── exporters/             # Estratégias de exportação
│   │   ├── ExporterStrategy.ts
│   │   └── strategies/
│   │       ├── ConsoleExporter.ts
│   │       ├── JsonExporter.ts
│   │       └── CsvExporter.ts
│   │
│   └── index.ts               # CLI principal
│
└── __tests__/                 # Testes unitários
```

### Camadas Arquiteturais

```
┌─────────────────────────────────────────────────────────┐
│                    CLI (index.ts)                       │
│              Interface de linha de comando              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│               Compiler (Orquestração)                   │
│          Pipeline de estágios de compilação             │
└─────────────────────────────────────────────────────────┘
                            ↓
┌──────────────┬──────────────────┬──────────────────────┐
│ LexerStage   │  ParserStage     │  SemanticStage       │
│ (Tokeniza)   │  (Analisa AST)   │  (Valida semântica)  │
└──────────────┴──────────────────┴──────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│            Languages (Domínio C++)                      │
│     Estratégias específicas + Gramática + Tokens        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│          Scanning (Infraestrutura genérica)             │
│    NFAs, Preprocessing, Line Mapping, Matching          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│           Errors (Sistema de erros unificado)           │
│       ErrorCollector + Tipos + Detecção + Formato       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│         Exporters (Estratégias de saída)                │
│          Console, JSON, CSV (Strategy Pattern)          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Design Patterns

### 1. **Pipeline Pattern** 🔄

**Onde**: `Compiler`, `ScanningPipeline`, `PreprocessingPipeline`

**Objetivo**: Coordenar sequências de transformações de forma organizada e fluente.

**Exemplo - Compiler**:
```typescript
class Compiler<TToken> {
  compile(source: string): CompilationResult<TToken> {
    // Pipeline de estágios
    const lexResult = this.lexer.execute(source);
    const parseResult = this.parser.execute(lexResult);
    const semResult = this.semantic.execute(parseResult);
    
    // Coleta todos os erros
    const errors = [
      ...lexResult.errors,
      ...parseResult.errors,
      ...semResult.errors
    ];
    
    return { tokens: lexResult.tokens, ast: semResult.ast, errors };
  }
}
```

**Exemplo - ScanningPipeline**:
```typescript
const result = new ScanningPipeline(sourceCode)
  .withPreprocessing([stripBom, lineSplicing, stripComments])
  .withLineMapping()
  .build();
```

**Por quê?**
- ✅ Separa cada etapa em unidades testáveis
- ✅ Facilita adicionar/remover transformações
- ✅ Interface fluente melhora legibilidade

---

### 2. **Strategy Pattern** ♟️

**Onde**: `LexerStrategy`, `ParserStrategy`, `SemanticStrategy`, `ExporterStrategy`

**Objetivo**: Permitir trocar algoritmos/implementações sem alterar o código cliente.

**Exemplo - Lexer Strategies**:
```typescript
// Estratégia manual (regex + loops)
class ManualLexerStrategy implements LexerStrategy<TokenRow> {
  tokenize(source: string, errorCollector?: ErrorCollector): TokenRow[] {
    // Implementação manual
  }
}

// Estratégia com NFA (Thompson Construction)
class NFALexerStrategy implements LexerStrategy<TokenRow> {
  tokenize(source: string, errorCollector?: ErrorCollector): TokenRow[] {
    // Implementação com autômatos
  }
}

// Uso intercambiável
const lexer = new LexerStage(new ManualLexerStrategy());
// ou
const lexer = new LexerStage(new NFALexerStrategy());
```

**Exemplo - Export Strategies**:
```typescript
const exporter = format === 'json' 
  ? new JsonExporter()
  : format === 'csv'
  ? new CsvExporter()
  : new ConsoleExporter();

exporter.export(data);
```

**Por quê?**
- ✅ Adicionar novos algoritmos sem quebrar código existente
- ✅ Testável: cada estratégia é independente
- ✅ Configurável: escolha em runtime

---

### 3. **Stage Pattern** 🎭

**Onde**: `LexerStage`, `ParserStage`, `SemanticStage`

**Objetivo**: Cada fase de compilação é um estágio independente e reutilizável.

**Exemplo**:
```typescript
class LexerStage<TToken> {
  constructor(private strategy: LexerStrategy<TToken>) {}
  
  execute(source: string): StageResult<TToken> {
    const errorCollector = new ErrorCollector();
    const tokens = this.strategy.tokenize(source, errorCollector);
    return { tokens, errors: errorCollector.getAll() };
  }
}
```

**Por quê?**
- ✅ Cada fase tem responsabilidade única (SRP)
- ✅ Isola erros por fase
- ✅ Reutilizável em outros contextos

---

### 4. **Collector Pattern** 📦

**Onde**: `ErrorCollector`

**Objetivo**: Centralizar coleta de erros de todas as fases.

**Exemplo**:
```typescript
class ErrorCollector {
  private errors: CompilationError[] = [];
  
  addLexical(error: LexicalError): void {
    this.errors.push(error);
  }
  
  addSyntactic(error: SyntacticError): void {
    this.errors.push(error);
  }
  
  addSemantic(error: SemanticError): void {
    this.errors.push(error);
  }
  
  getAll(): CompilationError[] {
    return [...this.errors];
  }
}
```

**Por quê?**
- ✅ Ponto único de coleta (Single Source of Truth)
- ✅ Facilita agregação multi-fase
- ✅ Separa detecção de formatação

---

### 5. **Builder Pattern** 🏗️

**Onde**: `PreprocessingPipeline`, `ScanningPipeline`, NFA builders

**Objetivo**: Construir objetos complexos com interface fluente.

**Exemplo - NFA Builders**:
```typescript
const identifier = concatenate(
  charClass(identifierStart),
  kleeneStar(charClass(identifierPart))
);

const number = plus(charClass(isDigit));

const megaNFA = combineAlternation([
  { afn: identifier, label: 'IDENT', priority: 1 },
  { afn: number, label: 'NUM', priority: 2 }
]);
```

**Por quê?**
- ✅ Composição declarativa
- ✅ Interface fluente legível
- ✅ Reutilização de componentes

---

### 6. **Matcher Pattern** 🎯

**Onde**: `NFAMatcher`, `matchLongest`

**Objetivo**: Encapsular lógica de matching de padrões.

**Exemplo**:
```typescript
const matcher = new NFAMatcher(megaNFA);
const match = matcher.matchAt(text, startIndex);

if (match) {
  console.log(`Matched: ${match.label}, length: ${match.length}`);
}
```

**Por quê?**
- ✅ Encapsula algoritmo complexo (epsilon-closure, move)
- ✅ Interface simples para uso
- ✅ Testável isoladamente

---

### 7. **Factory Pattern** 🏭

**Onde**: `getCppLexer()`, NFA builders

**Objetivo**: Criar objetos complexos sem expor detalhes de construção.

**Exemplo**:
```typescript
export function getCppLexer(algorithm: 'manual' | 'nfa'): LexerStage<TokenRow> {
  const strategy = algorithm === 'nfa' 
    ? new NFALexerStrategy()
    : new ManualLexerStrategy();
  
  return new LexerStage(strategy);
}
```

**Por quê?**
- ✅ Abstrai escolha de implementação
- ✅ Centraliza lógica de criação
- ✅ Facilita manutenção

---

## 🔄 Fluxo de Compilação

### Diagrama de Sequência

```
┌────────┐     ┌──────────┐     ┌─────────┐     ┌────────┐     ┌──────────┐
│  CLI   │     │ Compiler │     │  Lexer  │     │ Parser │     │ Semantic │
└───┬────┘     └────┬─────┘     └────┬────┘     └───┬────┘     └────┬─────┘
    │               │                 │              │               │
    │ compile()     │                 │              │               │
    │──────────────>│                 │              │               │
    │               │                 │              │               │
    │               │ execute(source) │              │               │
    │               │────────────────>│              │               │
    │               │                 │              │               │
    │               │                 │ 1. Preprocessing            │
    │               │                 │    (stripBom, comments)     │
    │               │                 │ 2. Line mapping             │
    │               │                 │ 3. Tokenization (NFA/Manual)│
    │               │                 │ 4. Error detection          │
    │               │                 │              │               │
    │               │ tokens + errors │              │               │
    │               │<────────────────│              │               │
    │               │                 │              │               │
    │               │    execute(tokens)             │               │
    │               │────────────────────────────────>│               │
    │               │                 │              │               │
    │               │                 │              │ 1. Build AST │
    │               │                 │              │ 2. Check syntax│
    │               │                 │              │ 3. Report errors│
    │               │                 │              │               │
    │               │       ast + errors             │               │
    │               │<────────────────────────────────│               │
    │               │                 │              │               │
    │               │         execute(ast + tokens)  │               │
    │               │────────────────────────────────────────────────>│
    │               │                 │              │               │
    │               │                 │              │  1. Build symbol table│
    │               │                 │              │  2. Check types│
    │               │                 │              │  3. Check scopes│
    │               │                 │              │  4. Report errors│
    │               │                 │              │               │
    │               │               ast + errors     │               │
    │               │<────────────────────────────────────────────────│
    │               │                 │              │               │
    │ result        │                 │              │               │
    │<──────────────│                 │              │               │
    │               │                 │              │               │
    │ export()      │                 │              │               │
    │──────────────>│                 │              │               │
```

### Passo a Passo Detalhado

#### **Fase 1: Análise Léxica** 🔍

```typescript
// 1. Leitura do código-fonte
const sourceCode = readTextFile(filePath);

// 2. Pré-processamento (preserva comprimento)
const preprocessed = runPreprocessPipeline(sourceCode, [
  stripBom,          // Remove BOM UTF-8
  lineSplicing,      // Une linhas com \ no final
  stripComments      // Remove comentários (// e /* */)
]);

// 3. Mapeamento de linhas (para erros)
const lineStarts = buildLineStartIndices(sourceCode);

// 4. Tokenização (Manual ou NFA)
const tokens: TokenRow[] = [];
let index = 0;

while (index < preprocessed.length) {
  // Encontra o match mais longo
  const match = matchLongest(preprocessed, index, megaNFA);
  
  if (match) {
    // Extrai lexema do código original
    const lexeme = sourceCode.substring(index, index + match.length);
    
    // Calcula posição (linha, coluna)
    const { line, column } = indexToLineCol(lineStarts, index);
    
    tokens.push({
      codigo: TOKEN_CODES[match.label],
      lexema,
      linha: line,
      coluna: column
    });
    
    index += match.length;
  } else {
    // Erro léxico: caractere inválido
    errorCollector.addLexical({
      type: LexicalErrorType.INVALID_CHARACTER,
      line, column, excerpt
    });
    index++;
  }
}

// 5. Detecção de erros adicionais
detectUnclosedStrings(sourceCode, lineStarts, errorCollector);
detectUnclosedComments(sourceCode, lineStarts, errorCollector);
```

**Erros Detectados**:
- ❌ String não fechada
- ❌ Comentário não fechado
- ❌ Caractere inválido

---

#### **Fase 2: Análise Sintática** 📝

```typescript
class Parser {
  private tokens: TokenRow[];
  private current = 0;
  
  parse(): ASTNode {
    const declarations: ASTNode[] = [];
    
    // Percorre todos os tokens
    while (!this.isAtEnd()) {
      try {
        const decl = this.parseDeclaration();
        declarations.push(decl);
      } catch (error) {
        // Erro sintático
        this.errorCollector.addSyntactic({
          type: SyntacticErrorType.UNEXPECTED_TOKEN,
          expected: ['int', 'float', 'void'],
          found: this.peek().lexema,
          line: this.peek().linha
        });
        this.synchronize(); // Recuperação de erro
      }
    }
    
    return { type: 'Program', declarations };
  }
  
  private parseDeclaration(): ASTNode {
    const type = this.consume(['int', 'float', 'void']);
    const name = this.consume('IDENTIFIER');
    
    if (this.match('(')) {
      return this.parseFunction(type, name);
    } else {
      return this.parseVariable(type, name);
    }
  }
}
```

**Erros Detectados**:
- ❌ Token inesperado
- ❌ Falta ponto-e-vírgula
- ❌ Parêntese não fechado
- ❌ Chave não fechada

---

#### **Fase 3: Análise Semântica** 🧠

```typescript
class SemanticAnalyzer {
  private symbolTable = new SymbolTable();
  
  analyze(ast: ASTNode, tokens: TokenRow[]): ASTNode {
    this.buildSymbolTable(ast, tokens);
    this.checkSemantics(ast);
    return ast;
  }
  
  private buildSymbolTable(ast: ASTNode, tokens: TokenRow[]): void {
    // Primeira passagem: coleta declarações
    for (const decl of ast.declarations) {
      if (this.symbolTable.isDeclared(decl.name)) {
        // Erro: redeclaração
        this.errorCollector.addSemantic({
          type: SemanticErrorType.REDECLARATION,
          identifier: decl.name,
          line: decl.line
        });
      } else {
        this.symbolTable.declare(decl.name, decl.type);
      }
    }
  }
  
  private checkSemantics(ast: ASTNode): void {
    // Segunda passagem: valida usos
    this.visitNodes(ast, (node) => {
      if (node.type === 'Identifier') {
        if (!this.symbolTable.isDeclared(node.name)) {
          // Erro: variável não declarada
          this.errorCollector.addSemantic({
            type: SemanticErrorType.UNDECLARED_VARIABLE,
            identifier: node.name,
            line: node.line
          });
        }
      }
    });
  }
}
```

**Erros Detectados**:
- ❌ Variável não declarada
- ❌ Função não declarada
- ❌ Redeclaração de identificador
- ❌ Tipo incompatível

---

## 🚨 Coleta de Erros

### Arquitetura do Sistema de Erros

```
┌─────────────────────────────────────────────────────────┐
│              ErrorCollector (Collector)                 │
│  Centraliza todos os erros de todas as fases            │
├─────────────────────────────────────────────────────────┤
│  + addLexical(error: LexicalError)                      │
│  + addSyntactic(error: SyntacticError)                  │
│  + addSemantic(error: SemanticError)                    │
│  + getAll(): CompilationError[]                         │
│  + hasErrors(): boolean                                 │
└─────────────────────────────────────────────────────────┘
                            ↑
                            │ usa
          ┌─────────────────┼─────────────────┐
          │                 │                 │
┌─────────┴────────┐  ┌────┴──────────┐  ┌───┴──────────┐
│ LexicalError     │  │ SyntacticError│  │ SemanticError│
├──────────────────┤  ├───────────────┤  ├──────────────┤
│ + type           │  │ + type        │  │ + type       │
│ + line           │  │ + expected    │  │ + identifier │
│ + column         │  │ + found       │  │ + line       │
│ + excerpt        │  │ + line        │  │ + message    │
└──────────────────┘  └───────────────┘  └──────────────┘
```

### Tipos de Erros (Enums)

```typescript
// Erros Léxicos
enum LexicalErrorType {
  UNCLOSED_STRING = 'string_nao_fechada',
  UNCLOSED_COMMENT = 'comentario_nao_fechado',
  INVALID_CHARACTER = 'caractere_invalido'
}

// Erros Sintáticos
enum SyntacticErrorType {
  UNEXPECTED_TOKEN = 'token_inesperado',
  MISSING_SEMICOLON = 'falta_ponto_virgula',
  UNCLOSED_PARENTHESIS = 'parentese_nao_fechado',
  UNCLOSED_BRACE = 'chave_nao_fechada'
}

// Erros Semânticos
enum SemanticErrorType {
  UNDECLARED_VARIABLE = 'variavel_nao_declarada',
  UNDECLARED_FUNCTION = 'funcao_nao_declarada',
  REDECLARATION = 'redeclaracao',
  TYPE_MISMATCH = 'tipo_incompativel'
}
```

### Fluxo de Coleta

```typescript
// 1. Criação do coletor
const errorCollector = new ErrorCollector();

// 2. Passar para cada fase
const lexer = new LexerStage(strategy);
const lexResult = lexer.execute(source); // Usa errorCollector internamente

const parser = new ParserStage();
const parseResult = parser.execute(lexResult); // Usa errorCollector

const semantic = new SemanticStage();
const semResult = semantic.execute(parseResult); // Usa errorCollector

// 3. Agregação no Compiler
const allErrors = [
  ...lexResult.errors,
  ...parseResult.errors,
  ...semResult.errors
];

// 4. Formatação e exibição
if (allErrors.length > 0) {
  console.error('\n❌ ERROS ENCONTRADOS:\n');
  allErrors.forEach(err => {
    console.error(formatError(err));
  });
}
```

### Formatação de Erros

```typescript
function formatError(error: CompilationError): string {
  const phase = error.phase === 'lexical' ? '🔍 LÉXICO'
             : error.phase === 'syntactic' ? '📝 SINTÁTICO'
             : '🧠 SEMÂNTICO';
  
  return `
${phase} | Linha ${error.line}, Coluna ${error.column}
Tipo: ${error.type}
${error.excerpt}
${' '.repeat(error.column - 1)}^ aqui
  `.trim();
}
```

**Exemplo de Saída**:
```
❌ ERROS ENCONTRADOS:

🔍 LÉXICO | Linha 5, Coluna 23
Tipo: string_nao_fechada
  printf("Hello World
                      ^ aqui

📝 SINTÁTICO | Linha 12, Coluna 5
Tipo: falta_ponto_virgula
  return 0
      ^ aqui (esperado: ';')

🧠 SEMÂNTICO | Linha 8, Coluna 10
Tipo: variavel_nao_declarada
Identificador 'count' não foi declarado neste escopo
```

---

## 📦 Módulos Principais

### 1. **scanning/** - Infraestrutura Genérica

**Responsabilidade**: Ferramentas de baixo nível para scanning, independentes de linguagem.

**Submódulos**:

#### **nfa/** - Autômatos Finitos
```typescript
// Thompson Construction
const identifier = concatenate(
  charClass(c => /[A-Za-z_]/.test(c)),
  kleeneStar(charClass(c => /[A-Za-z0-9_]/.test(c)))
);

const number = plus(charClass(c => /[0-9]/.test(c)));

// Combinação
const megaNFA = combineAlternation([
  { afn: identifier, label: 'IDENT', priority: 1 },
  { afn: number, label: 'NUM', priority: 2 }
]);

// Matching
const match = matchLongest(text, index, megaNFA);
```

#### **preprocessing/** - Transformações de Texto
```typescript
const preprocessed = runPreprocessPipeline(sourceCode, [
  stripBom,        // Remove UTF-8 BOM
  lineSplicing,    // Une linhas com \
  stripComments    // Remove // e /* */
]);
```

#### **line-mapping/** - Mapeamento de Posições
```typescript
const lineStarts = buildLineStartIndices(sourceCode);
const { line, column } = indexToLineCol(lineStarts, 142);
// line: 10, column: 23
```

---

### 2. **languages/cpp/** - Domínio C++

**Responsabilidade**: Implementação específica da linguagem C++.

**Submódulos**:

#### **lexer/** - Análise Léxica
```typescript
// Estratégia Manual
class ManualLexerStrategy implements LexerStrategy<TokenRow> {
  tokenize(source: string, errors?: ErrorCollector): TokenRow[] {
    // Regex + loops manuais
  }
}

// Estratégia NFA
class NFALexerStrategy implements LexerStrategy<TokenRow> {
  tokenize(source: string, errors?: ErrorCollector): TokenRow[] {
    // Thompson Construction + matchLongest
  }
}
```

#### **parser/** - Análise Sintática
```typescript
class Parser {
  parse(): ASTNode {
    // Recursive descent parsing
    // Constrói AST (Abstract Syntax Tree)
  }
}
```

#### **semantic/** - Análise Semântica
```typescript
class SemanticAnalyzer {
  analyze(ast: ASTNode, tokens: TokenRow[]): ASTNode {
    // Symbol table
    // Type checking
    // Scope validation
  }
}
```

---

### 3. **compiler/** - Orquestração

**Responsabilidade**: Coordena todas as fases de compilação.

```typescript
class Compiler<TToken> {
  constructor(
    private lexer: LexerStage<TToken>,
    private parser: ParserStage,
    private semantic: SemanticStage
  ) {}
  
  compile(source: string): CompilationResult<TToken> {
    // Pipeline de estágios
    const lexResult = this.lexer.execute(source);
    const parseResult = this.parser.execute(lexResult);
    const semResult = this.semantic.execute(parseResult);
    
    return {
      tokens: lexResult.tokens,
      ast: semResult.ast,
      errors: [
        ...lexResult.errors,
        ...parseResult.errors,
        ...semResult.errors
      ]
    };
  }
}
```

---

### 4. **errors/** - Sistema de Erros

**Responsabilidade**: Tipos genéricos e coletor unificado.

```typescript
// Tipos genéricos
interface LexicalError {
  phase: 'lexical';
  type: LexicalErrorType;
  line: number;
  column: number;
  excerpt: string;
}

// Coletor unificado
class ErrorCollector {
  private errors: CompilationError[] = [];
  
  addLexical(error: LexicalError): void {
    this.errors.push(error);
  }
  
  getAll(): CompilationError[] {
    return [...this.errors];
  }
}
```

---

### 5. **exporters/** - Exportação de Dados

**Responsabilidade**: Estratégias para diferentes formatos de saída.

```typescript
interface ExporterStrategy {
  export(data: ExportData): void;
}

class ConsoleExporter implements ExporterStrategy {
  export(data: ExportData): void {
    console.table(data.tokens);
  }
}

class JsonExporter implements ExporterStrategy {
  export(data: ExportData): void {
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync('output.json', json);
  }
}

class CsvExporter implements ExporterStrategy {
  export(data: ExportData): void {
    const csv = convertToCSV(data.tokens);
    fs.writeFileSync('output.csv', csv);
  }
}
```

---

## 📤 Exportação de Dados

### Formatos Suportados

#### 1. **Console** 🖥️
```bash
npm start -- examples/example.cpp
```

**Saída**:
```
╔════════╤═══════════╤════════╤════════╗
║ Código │ Lexema    │ Linha  │ Coluna ║
╟────────┼───────────┼────────┼────────╢
║ 1      │ int       │ 1      │ 1      ║
║ 2      │ main      │ 1      │ 5      ║
║ 3      │ (         │ 1      │ 9      ║
╚════════╧═══════════╧════════╧════════╝
```

#### 2. **JSON** 📄
```bash
npm start -- examples/example.cpp --json output.json
```

**Saída** (`output.json`):
```json
{
  "tokens": [
    { "codigo": 1, "lexema": "int", "linha": 1, "coluna": 1 },
    { "codigo": 2, "lexema": "main", "linha": 1, "coluna": 5 }
  ],
  "errors": [
    {
      "phase": "lexical",
      "type": "string_nao_fechada",
      "line": 5,
      "column": 23,
      "excerpt": "printf(\"Hello World"
    }
  ]
}
```

#### 3. **CSV** 📊
```bash
npm start -- examples/example.cpp --csv output.csv
```

**Saída** (`output.csv`):
```csv
codigo,lexema,linha,coluna
1,int,1,1
2,main,1,5
3,(,1,9
```

---

## 🧠 Filosofia de Design

### 1. **Separação de Responsabilidades**

Cada módulo tem uma responsabilidade única e bem definida:

- **scanning/**: Infraestrutura de baixo nível (NFAs, preprocessing, line mapping)
- **languages/**: Domínio da linguagem (C++, futuramente Python, etc.)
- **compiler/**: Orquestração das fases
- **errors/**: Sistema de erros unificado
- **exporters/**: Estratégias de saída

**Benefícios**:
- ✅ Fácil de testar isoladamente
- ✅ Fácil de modificar uma parte sem afetar outras
- ✅ Reutilização de código

---

### 2. **Genericidade e Extensibilidade**

O sistema é genérico por design:

```typescript
// Compiler genérico (aceita qualquer tipo de token)
class Compiler<TToken> {
  constructor(
    private lexer: LexerStage<TToken>,
    private parser: ParserStage,
    private semantic: SemanticStage
  ) {}
}

// Uso para C++
const cppCompiler = new Compiler(
  getCppLexer('nfa'),
  getCppParser(),
  getCppSemanticAnalyzer()
);

// Futuro: uso para Python
const pythonCompiler = new Compiler(
  getPythonLexer('regex'),
  getPythonParser(),
  getPythonSemanticAnalyzer()
);
```

**Benefícios**:
- ✅ Fácil adicionar novas linguagens
- ✅ Reutiliza infraestrutura genérica (scanning/)
- ✅ Type-safe com TypeScript generics

---

### 3. **Testabilidade**

Cada componente é facilmente testável:

```typescript
// Teste de Lexer
test('tokenize identificadores', () => {
  const strategy = new ManualLexerStrategy();
  const tokens = strategy.tokenize('int main x', new ErrorCollector());
  
  expect(tokens).toHaveLength(3);
  expect(tokens[0].lexema).toBe('int');
  expect(tokens[1].lexema).toBe('main');
  expect(tokens[2].lexema).toBe('x');
});

// Teste de Parser
test('parse declaração de variável', () => {
  const parser = new Parser(tokens);
  const ast = parser.parse();
  
  expect(ast.type).toBe('VariableDeclaration');
  expect(ast.name).toBe('x');
});

// Teste de ErrorCollector
test('coleta múltiplos erros', () => {
  const collector = new ErrorCollector();
  collector.addLexical({ ... });
  collector.addSyntactic({ ... });
  
  expect(collector.getAll()).toHaveLength(2);
});
```

---

### 4. **Clean Code Principles**

#### **KISS (Keep It Simple, Stupid)**
- Evita abstrações desnecessárias
- Código direto e legível
- Sem over-engineering

#### **YAGNI (You Aren't Gonna Need It)**
- Implementa apenas o necessário
- Não adiciona features "por precaução"
- Extensível quando necessário

#### **DRY (Don't Repeat Yourself)**
- Reutiliza código comum em `scanning/`
- Estratégias compartilham interfaces
- Utils centralizados

#### **Single Responsibility Principle**
- Cada classe tem uma responsabilidade
- `ErrorCollector` apenas coleta erros
- `LexerStage` apenas executa lexer
- `Parser` apenas faz parsing

---

### 5. **Design Patterns vs. Over-Engineering**

**Quando usar patterns**:
- ✅ Resolve problema real
- ✅ Melhora clareza do código
- ✅ Facilita extensibilidade

**Quando NÃO usar**:
- ❌ "Por que sim" ou "para praticar"
- ❌ Adiciona complexidade desnecessária
- ❌ Torna código mais difícil de entender

**Exemplo no projeto**:
- ✅ **Strategy Pattern**: Permite trocar algoritmo de lexer (Manual vs NFA)
- ✅ **Pipeline Pattern**: Coordena fases de compilação naturalmente
- ❌ **Abstract Factory**: Seria over-engineering para criar strategies

---

## 🎓 Lições Aprendidas

### 1. **Arquitetura Evolutiva**

O projeto começou simples e evoluiu conforme necessário:

1. **Versão 1**: Funções soltas, código procedural
2. **Versão 2**: Separação em módulos (`lex/`, `parse/`, `semantic/`)
3. **Versão 3**: Tentativa de arquitetura complexa (rejeitada por ser over-engineering)
4. **Versão 4**: Balance entre simplicidade e estrutura (atual)

**Lição**: Comece simples, refatore quando houver necessidade real.

---

### 2. **Nomenclatura Importa**

Nomenclatura clara melhora compreensão:

- `lex/` → `scanning/`: Mais descritivo
- `tokenize/` → `lexer/`: Terminologia padrão de compiladores
- `parse/` → `parser/`: Consistência
- `output/` → `exporters/`: Intenção clara

**Lição**: Use nomenclatura padrão da área (compiladores, no caso).

---

### 3. **Documentação Visual**

Diagramas e exemplos são mais efetivos que texto puro:

- ✅ Diagramas de sequência
- ✅ Diagramas de arquitetura
- ✅ Exemplos de código
- ✅ Saídas esperadas

**Lição**: Mostre, não apenas descreva.

---

## 🚀 Uso Prático

### Compilação Básica
```bash
npm start -- examples/example.cpp
```

### Exportar JSON
```bash
npm start -- examples/example.cpp --json output.json
```

### Exportar CSV
```bash
npm start -- examples/example.cpp --csv output.csv
```

### Trocar Algoritmo de Lexer
```typescript
// Em src/index.ts
const compiler = new Compiler(
  getCppLexer('manual'), // ou 'nfa'
  getCppParser(),
  getCppSemanticAnalyzer()
);
```

### Executar Testes
```bash
npm test
```

---

## 📚 Referências

- **Compiladores**: "Compilers: Principles, Techniques, and Tools" (Dragon Book)
- **Design Patterns**: "Design Patterns" (Gang of Four)
- **Clean Code**: "Clean Code" (Robert C. Martin)
- **Thompson Construction**: Algoritmo clássico de construção de NFAs
- **Recursive Descent Parsing**: Técnica de parsing top-down

---

## 🏆 Conclusão

O **Language Extractor** é um exemplo de como aplicar princípios de engenharia de software de forma equilibrada:

- ✅ **Design Patterns** onde fazem sentido
- ✅ **Arquitetura limpa** e compreensível
- ✅ **Código testável** e manutenível
- ✅ **Extensível** para novas features
- ✅ **Simples** o suficiente para ser educacional

**A arquitetura não é perfeita, mas é apropriada para o problema que resolve.**

---

**Desenvolvido com ❤️ como projeto educacional de compiladores.**

