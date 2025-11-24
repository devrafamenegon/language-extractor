# 📚 Conceitos de Compiladores - Language Extractor

Este documento explica os **conceitos fundamentais** de compiladores implementados neste projeto. É um guia educacional para entender como funciona cada fase da compilação.

---

## 📖 Índice

1. [O que é um Compilador?](#o-que-é-um-compilador)
2. [Fases do Compilador](#fases-do-compilador)
3. [Pré-processamento](#pré-processamento)
4. [Análise Léxica (Lexer)](#análise-léxica-lexer)
5. [Análise Sintática (Parser)](#análise-sintática-parser)
6. [Análise Semântica](#análise-semântica)
7. [Sistema de Erros](#sistema-de-erros)
8. [Fluxo Completo de Compilação](#fluxo-completo-de-compilação)

---

## O que é um Compilador?

Um **compilador** é um programa que traduz código fonte escrito em uma linguagem de programação (como C++) para outra forma (código de máquina, bytecode, ou outra linguagem).

### Front-end vs Back-end

Um compilador típico é dividido em duas partes:

- **Front-end** (o que este projeto implementa):
  - Análise léxica
  - Análise sintática
  - Análise semântica
  - Geração de representação intermediária

- **Back-end** (não implementado aqui):
  - Otimização
  - Geração de código
  - Alocação de registradores

Este projeto é um **compilador front-end educacional** focado nas fases de análise.

---

## Fases do Compilador

```
┌─────────────────┐
│  Código Fonte   │  "int main() { ... }"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Pré-processador │  Remove BOM, faz line splicing, remove comentários
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Análise Léxica  │  Gera sequência de tokens
└────────┬────────┘  [int, main, (, ), {, ...}
         │
         ▼
┌─────────────────┐
│ Análise         │  Verifica estrutura sintática
│ Sintática       │  (gramática da linguagem)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Análise         │  Verifica regras de tipos,
│ Semântica       │  escopos, declarações
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Tokens + AST   │  Saída: tokens válidos + erros (se houver)
└─────────────────┘
```

---

## Pré-processamento

Antes da tokenização, o código fonte passa por uma **pipeline de pré-processamento** que prepara o texto mantendo a correspondência de posições.

### Por que preservar posições?

É crucial manter os **índices originais** do código para reportar erros com linha e coluna corretas, mesmo após remover comentários.

### Pipeline de Pré-processamento

#### 1. **Strip BOM** (Byte Order Mark)
Remove o BOM UTF-8 (`\uFEFF`) se presente no início do arquivo.

```
Entrada:  "\uFEFFint main()"
Saída:    "int main()"
```

#### 2. **Line Splicing**
Une linhas terminadas com `\` (backslash), seguindo a especificação C/C++.

```
Entrada:  "int x = \\\n    42;"
Saída:    "int x =     42;"
          ^^^^^^^^^ espaços mantidos para preservar posição
```

#### 3. **Strip Comments**
Remove comentários **mantendo o comprimento** do texto original.

```
Entrada:  "int a; // comentário\nint b;"
Saída:    "int a;                \nint b;"
          ^^^^^^^^^^^^^^^^^^^^^^ espaços preservam índices
```

**Por que espaços em vez de remoção completa?**
- Mantém os índices absolutos inalterados
- Permite mapear tokens de volta ao código original
- Essencial para reportar linha/coluna corretas

---

## Análise Léxica (Lexer)

A análise léxica (ou **tokenização**) transforma uma sequência de caracteres em uma sequência de **tokens** (unidades léxicas significativas).

### O que é um Token?

Um token é uma unidade atômica de significado na linguagem:

```cpp
int main() {
│   │    │  │
│   │    │  └── token: delimitador '{'
│   │    └───── token: delimitador ')'
│   └────────── token: identificador 'main'
└────────────── token: palavra_reservada 'int'
```

### Estrutura de um Token

```typescript
{
  tipo: 'palavra_reservada',  // categoria do token
  codigo: 101,                // código único para este tipo/valor
  valor: 'int',               // lexema (texto original)
  linha: 1,                   // linha no código (1-based)
  coluna: 1                   // coluna no código (1-based)
}
```

### Categorias de Tokens

| Categoria | Exemplos | Código Base |
|-----------|----------|-------------|
| `palavra_reservada` | `int`, `if`, `return` | 101+ |
| `identificador` | `main`, `variavel`, `myFunc` | 201+ |
| `delimitador` | `(`, `)`, `{`, `}`, `;` | 301+ |
| `operador` | `+`, `-`, `*`, `==`, `++` | 401+ |
| `numero` | `42`, `123`, `0` | 501+ |
| `string` | `"hello"`, `"world"` | 601+ |
| `caractere` | `'a'`, `'\n'` | 701+ |

### Estratégias de Tokenização

Este projeto implementa **duas estratégias** diferentes:

#### 1. **Tokenização Manual** (Padrão)
Usa loops e regex para reconhecer padrões.

**Vantagens:**
- Simples de entender
- Boa performance
- Fácil de debugar

**Processo:**
```
1. Percorre caractere por caractere
2. Identifica início de padrão (dígito, letra, operador...)
3. Consome caracteres até o fim do padrão
4. Cria token com tipo, valor e posição
5. Repete até o fim do código
```

#### 2. **Tokenização por AFN** (Thompson)
Usa **Autômatos Finitos Não-Determinísticos** (NFA em inglês).

**Vantagens:**
- Demonstra teoria de linguagens formais
- Mais flexível para gramáticas complexas
- Implementa longest-match naturalmente

**Processo:**
```
1. Constrói AFN combinando regras (números, identificadores, operadores...)
2. Para cada posição no texto:
   - Executa AFN em paralelo para todas as regras
   - Escolhe o match mais longo (longest-match)
   - Em empate, usa prioridade (strings > operadores)
3. Cria token com o match vencedor
```

### Longest-Match e Prioridade

**Longest-Match**: Sempre escolhe o token mais longo possível.

```cpp
int abc;
│   │
│   └── 'abc' (não 'a', 'ab')
└────── 'int' (não 'i', 'in')
```

**Prioridade**: Em empate de comprimento, usa prioridade definida.

```cpp
if
│└── palavra_reservada 'if' (não identificador)
```

### Palavras-chave vs Identificadores

Palavras-chave são identificadores **reservados**:

```
1. Reconhece padrão de identificador: [A-Za-z_][A-Za-z0-9_]*
2. Verifica se está na tabela de palavras-chave
3. Se sim → palavra_reservada
4. Se não → identificador
```

### Detecção de Erros Léxicos

O lexer detecta:

- **Strings não fechadas**: `"hello` (sem aspas finais)
- **Caracteres não fechados**: `'a` (sem aspas finais)
- **Comentários não fechados**: `/* comentário` (sem `*/`)
- **Caracteres inválidos**: `@`, `#` (fora de strings)

**Exemplo:**
```cpp
int x = "unclosed string
        ^ ERRO: string não fechada (linha 1, coluna 9)
```

---

## Análise Sintática (Parser)

A análise sintática verifica se a sequência de tokens segue a **gramática** da linguagem.

### O que é uma Gramática?

Uma gramática define as **regras de estrutura** válidas:

```
programa     → declarações
declaração   → tipo identificador inicialização
inicialização → '=' expressão ';' | '(' parâmetros ')' bloco
expressão    → termo (('+' | '-') termo)*
termo        → fator (('*' | '/') fator)*
fator        → número | identificador | '(' expressão ')'
```

### Parser Recursivo Descendente

Este projeto usa **parser recursivo descendente** (top-down parsing):

```typescript
function declaração() {
  match('palavra_reservada');  // int
  match('identificador');       // main
  
  if (match('(')) {
    // É uma função
    expressão();
    expecta(')');
  }
  
  if (match('{')) {
    // Tem bloco
    while (!match('}')) {
      declaração();
    }
  }
}
```

### Precedência de Operadores

O parser implementa precedência através da estrutura recursiva:

```
expressão → igualdade
igualdade → comparação (('==' | '!=') comparação)*
comparação → termo (('<' | '>' | '<=' | '>=') termo)*
termo → fator (('+' | '-') fator)*
fator → unário (('*' | '/') unário)*
unário → ('-' | '!')? primário
primário → número | identificador | '(' expressão ')'
```

**Ordem de precedência** (maior para menor):
1. Primários (números, identificadores, parênteses)
2. Unários (`-`, `!`)
3. Multiplicação/Divisão (`*`, `/`)
4. Adição/Subtração (`+`, `-`)
5. Comparação (`<`, `>`, `<=`, `>=`)
6. Igualdade (`==`, `!=`)

### Validação de Delimitadores

O parser valida **balanceamento de delimitadores**:

```cpp
int main() {
  if (x > 0 {    // ERRO: esperado ')', encontrado '{'
    return 1;
  }
}
```

**Implementação com pilha:**
```
1. Ao encontrar '(', '{', '[' → empilha
2. Ao encontrar ')', '}', ']' → desempilha e valida par
3. No fim do parsing → verifica se pilha está vazia
```

### Detecção de Erros Sintáticos

O parser detecta:

- **Tokens inesperados**: `int ) main`
- **Tokens faltando**: `int main ( { }`
- **Delimitadores não fechados**: `int main() {` (sem `}`)
- **Pares incompatíveis**: `( ]`, `{ )`

---

## Análise Semântica

A análise semântica verifica **regras de significado** que não podem ser expressas na gramática sintática.

### O que é Semântica?

Enquanto a sintaxe verifica **estrutura**, a semântica verifica **significado**:

```cpp
int x;
int x;  // ERRO semântico: x já foi declarado
```

```cpp
y = 10;  // ERRO semântico: y não foi declarado
```

Ambos são **sintaticamente corretos**, mas **semanticamente errados**.

### Tabela de Símbolos

A análise semântica mantém uma **tabela de símbolos**:

```typescript
{
  'main': { tipo: 'funcao', linha: 1, coluna: 5 },
  'x':    { tipo: 'variavel', linha: 2, coluna: 7 },
  'soma': { tipo: 'funcao', linha: 5, coluna: 5 }
}
```

### Análise de Declarações

**Processo:**
```
1. Percorre tokens procurando declarações (tipo + identificador)
2. Para cada declaração:
   - Verifica se identificador já existe (redeclaração)
   - Adiciona à tabela de símbolos
   - Marca como variável ou função (detecta '(' ou '{')
```

**Exemplo:**
```cpp
int a;           // OK: adiciona 'a' à tabela
int b = 10;      // OK: adiciona 'b' à tabela
int a;           // ERRO: 'a' já foi declarado

int main() {     // OK: adiciona 'main' como função
  int local;     // OK: adiciona 'local' (escopo simplificado)
}
```

### Análise de Uso

**Processo:**
```
1. Coleta todos os identificadores usados (não em declarações)
2. Para cada uso:
   - Verifica se existe na tabela de símbolos
   - Se não existe → erro: identificador não declarado
```

**Exemplo:**
```cpp
int x = 10;
int y = x + z;  // ERRO: 'z' não foi declarado
```

### Escopo Simplificado

Este projeto implementa escopo **simplificado** por proximidade:

```cpp
int x;      // linha 1
int x;      // linha 2 - ERRO: muito próximo da linha 1

// ... 20 linhas depois ...
int x;      // linha 22 - OK: longe o suficiente (escopo diferente presumido)
```

**Threshold**: 10 linhas de distância

### Detecção de Erros Semânticos

- **Identificador não declarado**: uso de variável/função inexistente
- **Identificador redeclarado**: múltiplas declarações no mesmo escopo
- **Tipo incompatível** (preparado para expansão)
- **Função não declarada** (preparado para expansão)

---

## Sistema de Erros

O sistema de erros é **centralizado** e **unificado** para todas as fases.

### ErrorCollector

Um único `ErrorCollector` recebe erros de todas as fases:

```typescript
const errorCollector = new ErrorCollector();

// Fase léxica
errorCollector.addLexical({
  fase: 'lexico',
  tipo: 'string_nao_fechada',
  mensagem: 'String não fechada',
  linha: 5,
  coluna: 12,
  trecho: '"hello'
});

// Fase sintática
errorCollector.addSyntactic({
  fase: 'sintatico',
  tipo: 'parentese_nao_fechado',
  mensagem: 'Parêntese não fechado',
  linha: 7,
  coluna: 3,
  trecho: '(',
  esperado: ')',
  encontrado: '}'
});

// Fase semântica
errorCollector.addSemantic({
  fase: 'semantico',
  tipo: 'identificador_nao_declarado',
  mensagem: 'Identificador "x" não declarado',
  linha: 10,
  coluna: 5,
  trecho: 'x',
  identificador: 'x'
});
```

### Formato de Relatório

```
========== RELATÓRIO DE ERROS ==========
  linha:coluna → mensagem | contexto

[ANÁLISE LÉXICA] 1 erro(s)
  - 5:12    String não fechada | "hello

[ANÁLISE SINTÁTICA] 1 erro(s)
  - 7:3     Parêntese não fechado | ( (esperado=); encontrado=})

[ANÁLISE SEMÂNTICA] 1 erro(s)
  - 10:5    Identificador "x" não declarado | x (identificador=x)

TOTAL GERAL: 3 erro(s)
```

### Estratégia de Recuperação

O compilador usa **recuperação em modo pânico**:

```
1. Ao encontrar erro → reporta
2. Continua analisando (não para no primeiro erro)
3. Coleta TODOS os erros de todas as fases
4. Reporta tudo de uma vez
```

**Vantagens:**
- Usuário vê todos os problemas de uma vez
- Economiza tempo de compilação iterativa
- Melhor experiência de desenvolvimento

---

## Fluxo Completo de Compilação

### Visão Geral

```
┌──────────────────────────────────────────────────────────────┐
│                    CÓDIGO FONTE (input.cpp)                   │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Pré-processamento          │
        │  - Strip BOM                 │
        │  - Line Splicing             │
        │  - Strip Comments            │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   FASE 1: Análise Léxica     │◄────┐
        │  - Tokenização               │     │
        │  - Detecção de erros léxicos │     │
        └──────────────┬───────────────┘     │
                       │                     │
                       ▼                     │
                  [Token[]]                  │
                       │                     │
                       ▼                     │
        ┌──────────────────────────────┐    │
        │   FASE 2: Análise Sintática  │    │
        │  - Parsing recursivo         │    │ ErrorCollector
        │  - Validação de estrutura    │────┤ (centralizado)
        │  - Detecção de erros sintát. │    │
        └──────────────┬───────────────┘    │
                       │                     │
                       ▼                     │
                  [Token[]]                  │
                       │                     │
                       ▼                     │
        ┌──────────────────────────────┐    │
        │   FASE 3: Análise Semântica  │    │
        │  - Tabela de símbolos        │    │
        │  - Verificação de escopo     │────┘
        │  - Detecção de erros semânt. │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │      Agregação de Erros      │
        │  - Coleta erros das 3 fases  │
        │  - Formata relatório         │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │      Exportação (Strategy)   │
        │  - Console                   │
        │  - JSON                      │
        │  - CSV                       │
        └──────────────┬───────────────┘
                       │
                       ▼
              Tokens + Erros
```

### Exemplo Passo a Passo

**Código fonte:**
```cpp
int main() {
  int a = "unclosed;
  b = 10;
}
```

**Passo 1: Pré-processamento**
```
Input:  'int main() {\n  int a = "unclosed;\n  b = 10;\n}'
Output: 'int main() {\n  int a = "unclosed;\n  b = 10;\n}'
        (sem mudanças, pois não há BOM, line splicing ou comentários)
```

**Passo 2: Análise Léxica**
```
Tokens gerados:
  [int, main, (, ), {, int, a, =]
  
Erro detectado:
  ❌ Linha 2, coluna 11: String não fechada (""unclosed;")
```

**Passo 3: Análise Sintática**
```
Parser continua mesmo com erro léxico anterior

Erro detectado:
  ❌ Linha 2, coluna 20: Token inesperado ';' (esperava-se '"')
```

**Passo 4: Análise Semântica**
```
Tabela de símbolos:
  - main (função, linha 1)
  - a (variável, linha 2)

Erro detectado:
  ❌ Linha 3, coluna 3: Identificador 'b' não declarado
```

**Passo 5: Relatório Final**
```
========== RELATÓRIO DE ERROS ==========

[ANÁLISE LÉXICA] 1 erro(s)
  - 2:11    String não fechada | "unclosed;

[ANÁLISE SINTÁTICA] 1 erro(s)
  - 2:20    Token inesperado ; | ; (esperado="; encontrado=;)

[ANÁLISE SEMÂNTICA] 1 erro(s)
  - 3:3     Identificador "b" não declarado | b (identificador=b)

TOTAL GERAL: 3 erro(s)
```

---

## Conceitos Avançados

### Gramáticas Livres de Contexto (CFG)

A sintaxe de C++ é uma **Context-Free Grammar**:

```
E → E + T | E - T | T
T → T * F | T / F | F
F → (E) | número | identificador
```

**Propriedades:**
- Cada regra tem um único símbolo não-terminal à esquerda
- Lado direito pode ter terminais e não-terminais
- Permite recursão

### Teoria de Autômatos

**AFN (NFA - Nondeterministic Finite Automaton)**:
- Pode ter múltiplas transições para o mesmo símbolo
- Pode ter transições ε (epsilon - sem consumir caractere)
- Implementação baseada no **Algoritmo de Thompson**

**Construção de Thompson**:
```
char 'a':  ─a→

a|b:       ─a→
          ↗   ↘
         ε     ε
          ↖   ↗
           ─b→

ab:        ─a→─b→

a*:        ┌──ε──┐
          ↗     ↘
         ─a→─ε→─
          ↖     ↗
           └─ε─┘
```

### LL(1) vs LR(1)

Este projeto usa **LL(1)** (Left-to-right, Leftmost derivation, 1 lookahead):
- Parser recursivo descendente
- Simples de implementar
- Fácil de entender e debugar

**LR(1)** seria mais poderoso, mas mais complexo:
- Bottom-up parsing
- Requer tabelas de parsing
- Mais difícil de implementar manualmente

---

## Conclusão

Este projeto demonstra de forma **educacional e prática** como um compilador front-end funciona:

✅ **Análise Léxica**: Transforma texto em tokens  
✅ **Análise Sintática**: Verifica estrutura gramatical  
✅ **Análise Semântica**: Valida regras de significado  
✅ **Sistema de Erros**: Coleta e reporta problemas de todas as fases  

Para entender **como** isso é implementado tecnicamente, consulte **[ARCHITECTURE.md](ARCHITECTURE.md)**.

---

## Referências

- **Compilers: Principles, Techniques, and Tools** (Dragon Book) - Aho, Lam, Sethi, Ullman
- **Engineering a Compiler** - Cooper & Torczon
- **Modern Compiler Implementation in ML/C/Java** - Andrew Appel
- **C++ Standard (ISO/IEC 14882)** - Especificação oficial da linguagem
