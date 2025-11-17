# 🎤 Guia de Apresentação - Language Extractor

> **Roteiro completo para apresentação em grupo (4 pessoas)**

Este guia divide a apresentação do projeto em **4 partes equilibradas**, com roteiro detalhado, tempo estimado e pontos-chave para cada apresentador.

---

## 📊 Visão Geral da Apresentação

| Parte | Apresentador | Tópicos | Tempo |
|-------|--------------|---------|-------|
| **1** | Pessoa A | Introdução + Visão Geral + Análise Léxica | 7-8 min |
| **2** | Pessoa B | Análise Sintática | 5-6 min |
| **3** | Pessoa C | Análise Semântica + Sistema de Erros | 6-7 min |
| **4** | Pessoa D | Arquitetura + Design Patterns + Demo | 7-8 min |

**Tempo Total**: 25-30 minutos  
**Tempo para Perguntas**: 5-10 minutos

---

## 👤 Parte 1: Introdução + Análise Léxica

**Apresentador**: Pessoa A  
**Tempo**: 7-8 minutos  
**Responsabilidade**: Contextualizar o projeto e explicar a primeira fase

---

### 🎯 Objetivos

- Apresentar o contexto e propósito do projeto
- Explicar o que é um compilador
- Detalhar a Análise Léxica (Tokenização)

---

### 📝 Roteiro Detalhado

#### **Slide 1: Título e Apresentação** (30s)

**O que falar**:
> "Bom dia/boa tarde! Hoje vamos apresentar o **Language Extractor**, um compilador educacional completo para C++. O projeto demonstra as três fases principais de um compilador front-end: análise léxica, sintática e semântica."

**Elementos visuais**:
```
┌─────────────────────────────────────┐
│   LANGUAGE EXTRACTOR                │
│   Compilador Educacional C++        │
│                                     │
│   [Equipe]                          │
│   • Pessoa A                        │
│   • Pessoa B                        │
│   • Pessoa C                        │
│   • Pessoa D                        │
└─────────────────────────────────────┘
```

---

#### **Slide 2: O Que é um Compilador?** (1min)

**O que falar**:
> "Um compilador é um programa que traduz código-fonte, escrito por humanos, em código de máquina, executável pelo computador. Ele funciona em fases sequenciais, como uma linha de produção."

**Elementos visuais**:
```
Código C++  →  [Compilador]  →  Código de Máquina
  (input)      Front-End          (output)
               Back-End
```

**Analogia para explicar**:
> "Imagine traduzir um livro do inglês para português. Você precisa: 1) Reconhecer as palavras, 2) Entender a gramática, 3) Compreender o significado. Um compilador faz exatamente isso com código!"

---

#### **Slide 3: As Três Fases** (1min)

**O que falar**:
> "Nosso compilador processa o código em três fases distintas. Cada uma tem uma responsabilidade específica e detecta tipos diferentes de erros."

**Elementos visuais**:
```
┌─────────────────────────────────────┐
│  FASE 1: Análise Léxica             │
│  Quebra texto em tokens             │
│  "int main()" → [int][main][()]     │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  FASE 2: Análise Sintática          │
│  Valida estrutura gramatical        │
│  [int][main][()] → ✓ Função válida  │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  FASE 3: Análise Semântica          │
│  Verifica significado e contexto    │
│  ✓ 'main' declarado corretamente    │
└─────────────────────────────────────┘
```

**Ponto-chave**:
> "Separar em fases facilita a manutenção e o entendimento do código."

---

#### **Slide 4: Análise Léxica - Conceito** (1min)

**O que falar**:
> "A primeira fase é a **Análise Léxica**, também chamada de tokenização. Ela quebra o texto em pedaços significativos chamados **tokens**, como separar palavras em uma frase."

**Exemplo visual**:
```
Antes:
"Ojogadorchutouabola"

Depois:
[O] [jogador] [chutou] [a] [bola]
```

**Em C++**:
```cpp
int main() { return 0; }

         ↓ TOKENIZAÇÃO

[int][main][{][return][0][;][}]
```

---

#### **Slide 5: Tipos de Tokens** (1min)

**O que falar**:
> "Cada token é classificado em categorias. Por exemplo, 'int' é uma palavra reservada, 'main' é um identificador, e ';' é um delimitador."

**Elementos visuais**:
```
┌──────────────────┬─────────────────┐
│ Tipo             │ Exemplos        │
├──────────────────┼─────────────────┤
│ Palavra Reservada│ int, if, return │
│ Identificador    │ main, x, soma   │
│ Número           │ 0, 123, 456     │
│ String           │ "Hello"         │
│ Operador         │ +, -, *, /      │
│ Delimitador      │ {, }, (, ), ;   │
└──────────────────┴─────────────────┘
```

---

#### **Slide 6: Exemplo Prático de Tokenização** (1min)

**O que falar**:
> "Vamos ver um exemplo real. Este código C++ é transformado em 9 tokens, cada um com tipo, valor e posição."

**Código**:
```cpp
int main() { return 0; }
```

**Tabela de Tokens**:
```
┌───┬──────────────────┬────────┬───────┬────────┐
│ # │ Tipo             │ Valor  │ Linha │ Coluna │
├───┼──────────────────┼────────┼───────┼────────┤
│ 1 │ palavra_reservada│ int    │ 1     │ 1      │
│ 2 │ identificador    │ main   │ 1     │ 5      │
│ 3 │ delimitador      │ (      │ 1     │ 9      │
│ 4 │ delimitador      │ )      │ 1     │ 10     │
│ 5 │ delimitador      │ {      │ 1     │ 12     │
│ 6 │ palavra_reservada│ return │ 1     │ 14     │
│ 7 │ numero           │ 0      │ 1     │ 21     │
│ 8 │ delimitador      │ ;      │ 1     │ 22     │
│ 9 │ delimitador      │ }      │ 1     │ 24     │
└───┴──────────────────┴────────┴───────┴────────┘
```

**Ponto-chave**:
> "Note que cada token armazena sua posição. Isso é crucial para reportar erros de forma precisa."

---

#### **Slide 7: Erros Léxicos** (1min)

**O que falar**:
> "A análise léxica detecta erros como caracteres inválidos e strings não fechadas. Vamos ver exemplos."

**Exemplos de erros**:

```cpp
// ❌ Erro 1: Caractere inválido
int x = 10 @ 5;
         //  ^--- ERRO: '@' não é válido em C++

// ❌ Erro 2: String não fechada
printf("Hello World
       //  ^--- ERRO: String não foi fechada

// ❌ Erro 3: Comentário não fechado
/* Este comentário nunca fecha...
int main() {
// ^--- ERRO: Comentário /* */ não fechado
```

---

#### **Slide 8: Estratégias de Tokenização** (30s)

**O que falar**:
> "Implementamos duas estratégias de tokenização: Manual, usando loops e regex, e NFA, usando autômatos finitos baseados em Thompson Construction. Isso demonstra o padrão Strategy."

**Elementos visuais**:
```
┌──────────────────────────────────────┐
│  ESTRATÉGIA 1: MANUAL               │
│  • Loops e Regex                     │
│  • Mais simples                      │
│  • Didático                          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  ESTRATÉGIA 2: NFA (Thompson)       │
│  • Autômatos Finitos                 │
│  • Mais robusto                      │
│  • Teórico                           │
└──────────────────────────────────────┘
```

**Transição**:
> "Com os tokens gerados, passamos para a próxima fase. [Pessoa B] vai explicar a Análise Sintática."

---

### ✅ Checklist para Pessoa A

- [ ] Praticou a apresentação dentro do tempo (7-8 min)
- [ ] Conhece bem os conceitos de compiladores
- [ ] Sabe explicar tokenização com exemplos
- [ ] Preparou analogias simples (livro, frase)
- [ ] Está pronto para responder perguntas sobre léxico

---

## 👤 Parte 2: Análise Sintática

**Apresentador**: Pessoa B  
**Tempo**: 5-6 minutos  
**Responsabilidade**: Explicar a segunda fase do compilador

---

### 🎯 Objetivos

- Explicar o conceito de análise sintática
- Demonstrar como o parser valida a estrutura
- Mostrar exemplos de erros sintáticos

---

### 📝 Roteiro Detalhado

#### **Slide 9: Análise Sintática - Conceito** (1min)

**O que falar**:
> "Continuando de onde [Pessoa A] parou, agora temos uma lista de tokens. A **Análise Sintática**, ou parsing, verifica se esses tokens formam uma estrutura válida segundo as regras da gramática de C++."

**Analogia**:
> "Em português, você não pode dizer 'Cachorro late o rapidamente'. A gramática está errada. O parser faz o mesmo com código!"

**Elementos visuais**:
```
❌ INVÁLIDO:
"Cachorro late o rapidamente"
(gramática errada)

✅ VÁLIDO:
"O cachorro late rapidamente"
(gramática correta)
```

---

#### **Slide 10: O Que o Parser Valida** (1min)

**O que falar**:
> "O parser verifica quatro tipos principais de estruturas: declarações de variáveis, funções, expressões e blocos de código."

**Elementos visuais**:
```
1. DECLARAÇÕES DE VARIÁVEIS
   int x = 10;
   [tipo][id][=][valor][;] → ✓

2. DECLARAÇÕES DE FUNÇÕES
   int soma(int a, int b) { return a + b; }
   [tipo][id][(][params][)][{][corpo][}] → ✓

3. EXPRESSÕES
   x = a + b * c;
   [id][=][expr] → ✓

4. BLOCOS
   { int x = 10; return x; }
   [{][statements][}] → ✓
```

---

#### **Slide 11: Parser Recursivo Descendente** (1min)

**O que falar**:
> "Implementamos um parser recursivo descendente, que analisa o código de cima para baixo, da esquerda para a direita. Ele consome tokens e verifica se a sequência está correta."

**Exemplo visual**:
```cpp
int x = 10;

Parser verifica:
1. Primeiro token é um TIPO? ✓ (int)
2. Segundo token é um ID? ✓ (x)
3. Terceiro token é '='? ✓
4. Quarto token é VALOR? ✓ (10)
5. Quinto token é ';'? ✓

RESULTADO: Declaração válida! ✓
```

---

#### **Slide 12: Exemplos de Validação** (1min)

**O que falar**:
> "Vamos ver dois casos: um válido e um inválido."

**Caso 1 - Válido**:
```cpp
int x = 10;

[int] [x] [=] [10] [;]
  ↓    ↓   ↓   ↓   ↓
[tipo][id][op][num][fim]
→ Declaração válida ✓
```

**Caso 2 - Inválido**:
```cpp
int x = ;

[int] [x] [=] [;]
  ↓    ↓   ↓   ↓
[tipo][id][op][fim]
→ Falta valor! ✗
```

---

#### **Slide 13: Erros Sintáticos** (1-2min)

**O que falar**:
> "O parser detecta vários tipos de erros. Vejamos os mais comuns."

**Exemplos**:

```cpp
// ❌ Erro 1: Parêntese não fechado
int main( {
       // ^--- Esperado ')', encontrado '{'

// ❌ Erro 2: Ponto-e-vírgula faltando
int x = 10
return x;
        // ^--- Esperado ';' após declaração

// ❌ Erro 3: Token inesperado
int main() {
  return 0 }
        // ^--- Esperado ';', encontrado '}'

// ❌ Erro 4: Chave não fechada
int main() {
  return 0;
  // ^--- Bloco não fechado (falta '}')
```

**Ponto-chave**:
> "Cada erro mostra exatamente onde está o problema e o que era esperado."

---

#### **Slide 14: Estrutura da AST (Conceitual)** (30s)

**O que falar**:
> "O parser constrói uma representação abstrata do código chamada AST - Abstract Syntax Tree. É como uma árvore genealógica do código."

**Exemplo visual**:
```
Código: int x = 10;

        AST:
    [Declaração]
      /    |    \
  [int]  [x]  [10]
```

**Transição**:
> "Com a estrutura validada, passamos para a fase final. [Pessoa C] vai explicar a Análise Semântica."

---

### ✅ Checklist para Pessoa B

- [ ] Praticou a apresentação dentro do tempo (5-6 min)
- [ ] Sabe explicar parsing com exemplos
- [ ] Conhece os tipos de erros sintáticos
- [ ] Preparou analogias de gramática
- [ ] Está pronto para perguntas sobre sintaxe

---

## 👤 Parte 3: Análise Semântica + Sistema de Erros

**Apresentador**: Pessoa C  
**Tempo**: 6-7 minutos  
**Responsabilidade**: Explicar a terceira fase e o sistema de erros unificado

---

### 🎯 Objetivos

- Explicar análise semântica
- Demonstrar validação de tipos e escopos
- Apresentar o sistema de coleta de erros
- Mostrar o relatório unificado

---

### 📝 Roteiro Detalhado

#### **Slide 15: Análise Semântica - Conceito** (1min)

**O que falar**:
> "Até agora validamos a forma do código. Agora precisamos validar o **significado**. A Análise Semântica verifica se o código faz sentido no contexto."

**Analogia**:
> "Esta frase é gramaticalmente correta mas não faz sentido: 'O gato bebeu o vento com o chapéu'. A análise semântica encontra esse tipo de problema no código."

**Exemplos**:

```cpp
// ✅ Gramática OK, Semântica OK
int x = 10;
printf("%d", x);  // 'x' foi declarado

// ✅ Gramática OK, ❌ Semântica ERRADA
printf("%d", x);  // 'x' NÃO foi declarado!
int x = 10;
```

---

#### **Slide 16: O Que é Verificado** (1-2min)

**O que falar**:
> "A análise semântica verifica quatro aspectos principais: declarações, redeclarações, escopos e uso de funções."

**Elementos visuais**:

**1. Declaração de Variáveis**
```cpp
int main() {
  x = 10;        // ❌ 'x' não declarado
  int x;         // Tarde demais
  return 0;
}

// Correto:
int main() {
  int x;         // ✅ Declaração primeiro
  x = 10;        // ✅ Uso depois
  return 0;
}
```

**2. Redeclaração**
```cpp
int main() {
  int x = 10;
  int x = 20;    // ❌ 'x' já declarado
  return 0;
}
```

**3. Escopo**
```cpp
int main() {
  {
    int x = 10;  // Declarado aqui
  }
  printf("%d", x);  // ❌ 'x' não existe neste escopo
  return 0;
}
```

**4. Funções**
```cpp
int main() {
  soma(1, 2);    // ❌ 'soma' não declarada
  return 0;
}
```

---

#### **Slide 17: Tabela de Símbolos** (1min)

**O que falar**:
> "Para rastrear declarações, usamos uma **Tabela de Símbolos**. É como um dicionário que guarda todos os identificadores e seus tipos."

**Exemplo visual**:
```cpp
Código:
int x = 10;
float y = 3.14;
int main() { ... }

Tabela de Símbolos:
┌──────────┬────────┬────────┐
│ Nome     │ Tipo   │ Escopo │
├──────────┼────────┼────────┤
│ x        │ int    │ global │
│ y        │ float  │ global │
│ main     │ função │ global │
└──────────┴────────┴────────┘
```

---

#### **Slide 18: Sistema de Coleta de Erros** (1min)

**O que falar**:
> "Uma característica importante do nosso compilador é o sistema unificado de coleta de erros. Diferente de alguns compiladores que param no primeiro erro, o nosso continua analisando e reporta **todos os erros de uma vez**."

**Elementos visuais**:
```
┌─────────────────────────────────────┐
│       ErrorCollector                │
│   (Coletor Centralizado)            │
└─────────────────────────────────────┘
         ↑         ↑         ↑
         │         │         │
    ┌────┴───┬────┴───┬────┴────┐
    │ Léxica │Sintática│Semântica│
    │ erros  │ erros   │ erros   │
    └────────┴─────────┴─────────┘
```

**Por quê?**
> "Para economizar tempo do desenvolvedor. Em vez de corrigir um erro por vez, você vê todos de uma vez!"

---

#### **Slide 19: Relatório de Erros** (1-2min)

**O que falar**:
> "Vamos ver como o relatório final fica. Este código tem erros em todas as três fases."

**Código com erros**:
```cpp
int main( {
  printf("Hello World
  x = 10;
  return 0;
}
```

**Relatório gerado**:
```
========== RELATÓRIO DE ERROS ==========

[ANÁLISE LÉXICA] 1 erro(s)
  - 2:10    String não fechada
    printf("Hello World
           ^--- Esperado '"' antes do fim da linha

[ANÁLISE SINTÁTICA] 1 erro(s)
  - 1:11    Token inesperado
    int main( {
              ^--- Esperado ')', encontrado '{'

[ANÁLISE SEMÂNTICA] 1 erro(s)
  - 3:3     Identificador "x" não declarado
    x = 10;
    ^--- 'x' não existe neste escopo

TOTAL GERAL: 3 erro(s)
```

**Ponto-chave**:
> "Cada erro mostra a fase, linha, coluna, tipo de erro e o trecho de código com o problema."

---

#### **Slide 20: Fluxo Completo de Erros** (30s)

**O que falar**:
> "O fluxo é simples: cada fase detecta seus erros, adiciona ao coletor, e no final tudo é agregado e apresentado de forma organizada."

**Diagrama**:
```
[Código] → [Léxica] → Erros Léxicos ──┐
              ↓                         │
          [Sintática] → Erros Sintáticos──→ [ErrorCollector]
              ↓                         │
          [Semântica] → Erros Semânticos─┘
                              ↓
                     [Relatório Final]
```

**Transição**:
> "Agora que entendemos todas as fases e o sistema de erros, [Pessoa D] vai mostrar a arquitetura do sistema e fazer uma demonstração ao vivo."

---

### ✅ Checklist para Pessoa C

- [ ] Praticou a apresentação dentro do tempo (6-7 min)
- [ ] Sabe explicar análise semântica com exemplos
- [ ] Conhece o funcionamento do ErrorCollector
- [ ] Preparou exemplos de erros em cada fase
- [ ] Está pronto para perguntas sobre semântica e erros

---

## 👤 Parte 4: Arquitetura + Design Patterns + Demo

**Apresentador**: Pessoa D  
**Tempo**: 7-8 minutos  
**Responsabilidade**: Explicar a arquitetura, patterns e demonstrar o sistema funcionando

---

### 🎯 Objetivos

- Apresentar a arquitetura do projeto
- Explicar os design patterns aplicados
- Demonstrar o compilador em ação
- Mostrar exportação em diferentes formatos

---

### 📝 Roteiro Detalhado

#### **Slide 21: Arquitetura do Projeto** (1min)

**O que falar**:
> "Vamos ver agora como o projeto está organizado. A arquitetura segue princípios de Clean Code e usa design patterns estrategicamente."

**Diagrama de módulos**:
```
┌─────────────────────────────────────┐
│          CLI (index.ts)             │
│     Interface linha de comando      │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│       Compiler (Pipeline)           │
│   Orquestra as três fases           │
└──────────────┬──────────────────────┘
               ↓
┌──────┬──────────────┬───────────────┐
│Lexer │   Parser     │   Semantic    │
│Stage │   Stage      │   Stage       │
└──────┴──────────────┴───────────────┘
               ↓
┌─────────────────────────────────────┐
│         Exporters                   │
│   Console, JSON, CSV                │
└─────────────────────────────────────┘
```

---

#### **Slide 22: Design Patterns - Visão Geral** (1min)

**O que falar**:
> "Aplicamos sete design patterns clássicos no projeto. Cada um resolve um problema específico de forma elegante."

**Tabela de patterns**:
```
┌──────────────┬──────────────────────────┐
│ Pattern      │ Onde é Usado             │
├──────────────┼──────────────────────────┤
│ Pipeline     │ Compiler (3 fases)       │
│ Strategy     │ Tokenização, Exportação  │
│ Stage        │ Lexer, Parser, Semantic  │
│ Collector    │ ErrorCollector           │
│ Builder      │ NFAs, Pipelines          │
│ Matcher      │ NFA Matching             │
│ Factory      │ Criação de strategies    │
└──────────────┴──────────────────────────┘
```

---

#### **Slide 23: Pipeline Pattern** (1min)

**O que falar**:
> "O pattern mais importante é o **Pipeline**. O Compiler coordena as três fases em sequência, passando os resultados de uma para outra."

**Código conceitual**:
```typescript
class Compiler {
  compile(source: string) {
    // Pipeline de estágios
    const lex = this.lexer.execute(source);
    const parse = this.parser.execute(lex);
    const sem = this.semantic.execute(parse);
    
    // Agrega todos os erros
    return {
      tokens: lex.tokens,
      errors: [
        ...lex.errors,
        ...parse.errors,
        ...sem.errors
      ]
    };
  }
}
```

---

#### **Slide 24: Strategy Pattern** (1min)

**O que falar**:
> "O **Strategy Pattern** permite trocar algoritmos em runtime. Usamos para tokenização (Manual vs NFA) e exportação (Console, JSON, CSV)."

**Diagrama**:
```
          Strategy
             ↓
    ┌────────┼────────┐
    ↓        ↓        ↓
 Manual     NFA    Console
Strategy  Strategy  Exporter
             ↓
    ┌────────┼────────┐
  JSON     CSV    Console
Exporter Exporter Exporter
```

**Benefícios**:
> "Fácil adicionar novos algoritmos sem modificar código existente."

---

#### **Slide 25: Estrutura de Diretórios** (30s)

**O que falar**:
> "A organização dos arquivos segue a separação de responsabilidades. Temos módulos para cada funcionalidade."

**Estrutura simplificada**:
```
src/
├── compiler/        # Orquestração
├── languages/       # C++ específico
│   └── cpp/
│       ├── lexer/
│       ├── parser/
│       └── semantic/
├── scanning/        # Infra genérica
│   ├── nfa/
│   ├── preprocessing/
│   └── line-mapping/
├── errors/          # Sistema de erros
└── exporters/       # Formatos de saída
```

---

#### **Slide 26: Demo - Preparação** (30s)

**O que falar**:
> "Agora vamos ver o compilador em ação! Vou demonstrar a análise de um arquivo C++ e a exportação em diferentes formatos."

**Preparação**:
1. Ter terminal aberto
2. Ter arquivo de teste pronto (`demo.cpp`)
3. Ter `results/` limpo

---

#### **Slide 27: Demo Parte 1 - Código Válido** (1-2min)

**O que falar**:
> "Primeiro, vamos analisar um código válido."

**Comandos**:
```bash
# Criar arquivo de teste
echo 'int main() { return 0; }' > demo.cpp

# Analisar (modo console)
npm run dev -- demo.cpp
```

**Saída esperada**:
```
Token: int       | Código: 101 | Linha: 1 | Coluna: 1
Token: main      | Código: 201 | Linha: 1 | Coluna: 5
...

✅ Análise concluída: 7 tokens, 0 erros
```

**O que destacar**:
> "Veja que todos os tokens foram reconhecidos com posição correta."

---

#### **Slide 28: Demo Parte 2 - Código com Erros** (1-2min)

**O que falar**:
> "Agora vamos introduzir erros para ver o sistema de detecção em ação."

**Comandos**:
```bash
# Criar arquivo com erros
cat > demo_erros.cpp << EOF
int main( {
  printf("Hello World
  x = 10;
  return 0;
}
EOF

# Analisar
npm run dev -- demo_erros.cpp
```

**Saída esperada**:
```
========== RELATÓRIO DE ERROS ==========

[ANÁLISE LÉXICA] 1 erro(s)
  - 2:10    String não fechada

[ANÁLISE SINTÁTICA] 1 erro(s)
  - 1:11    Token inesperado

[ANÁLISE SEMÂNTICA] 1 erro(s)
  - 3:3     Identificador "x" não declarado

TOTAL GERAL: 3 erro(s)
```

**O que destacar**:
> "Todos os erros foram detectados e reportados de forma clara, com linha e coluna exatas."

---

#### **Slide 29: Demo Parte 3 - Exportação** (1min)

**O que falar**:
> "O sistema suporta múltiplos formatos de saída. Vamos exportar para JSON e CSV."

**Comandos**:
```bash
# Exportar JSON
npm run dev -- --json demo.cpp

# Mostrar o arquivo gerado
cat results/demo.tokens.json

# Exportar CSV
npm run dev -- --csv demo.cpp

# Mostrar o arquivo gerado
cat results/demo.tokens.csv
```

**O que destacar**:
> "Todos os formatos contêm as mesmas informações, apenas em estruturas diferentes."

---

#### **Slide 30: Demo Parte 4 - Tokenizador NFA** (30s)

**O que falar**:
> "Por fim, vamos usar o tokenizador NFA, baseado em Thompson Construction."

**Comandos**:
```bash
# Usar NFA
npm run dev -- --afn demo.cpp

# Combinar com JSON
npm run dev -- --afn --json demo.cpp
```

**O que destacar**:
> "O resultado é idêntico, mas o algoritmo interno é diferente. Isso demonstra o Strategy Pattern em ação!"

---

#### **Slide 31: Conclusão** (1min)

**O que falar**:
> "Para concluir, o Language Extractor é um compilador educacional completo que demonstra as três fases de análise, usa design patterns de forma estratégica, e fornece um sistema robusto de detecção de erros."

**Pontos-chave**:
```
✅ Três fases completas (Léxica, Sintática, Semântica)
✅ Duas estratégias de tokenização (Manual e NFA)
✅ Sistema unificado de erros
✅ Múltiplos formatos de exportação
✅ Arquitetura limpa e extensível
✅ Design patterns aplicados estrategicamente
✅ Código bem testado e documentado
```

---

#### **Slide 32: Recursos e Documentação** (30s)

**O que falar**:
> "O projeto está totalmente documentado. Temos três documentos principais e uma suíte completa de testes."

**Documentação**:
```
📚 CONCEPTS.md - Guia conceitual
🏗️ ARCHITECTURE.md - Detalhes técnicos
📖 README.md - Guia de uso
🧪 __tests__/ - Suíte de testes
```

**Contato e Repositório**:
> "O código está disponível no repositório [URL]. Estamos abertos a perguntas!"

---

### ✅ Checklist para Pessoa D

- [ ] Praticou a apresentação dentro do tempo (7-8 min)
- [ ] Conhece a arquitetura completa
- [ ] Sabe explicar cada design pattern
- [ ] Testou todos os comandos da demo
- [ ] Preparou arquivos de teste
- [ ] Está pronto para perguntas técnicas

---

## 🎯 Dicas Gerais para Todos

### ✅ Antes da Apresentação

1. **Ensaiem juntos** - Pelo menos 2-3 vezes completas
2. **Cronometrem** - Cada um deve respeitar seu tempo
3. **Transições** - Pratiquem as passagens de uma pessoa para outra
4. **Slides** - Usem slides simples e visuais (evitem muito texto)
5. **Backup** - Tenham screenshots da demo caso algo falhe

### 🎤 Durante a Apresentação

1. **Fale devagar** - É melhor terminar antes do que atropelado
2. **Olhe para a audiência** - Não fique só no computador
3. **Use exemplos** - Analogias ajudam muito
4. **Respire** - Faça pausas entre slides
5. **Apoiem uns aos outros** - Complementem quando necessário

### 💡 Respostas para Perguntas Comuns

**P: "Por que não usar ferramentas prontas como Flex/Bison?"**
> R: "O objetivo é educacional. Implementar do zero ajuda a entender os conceitos profundamente."

**P: "O compilador gera código de máquina?"**
> R: "Não, é um front-end educacional. Ele valida o código mas não gera executável."

**P: "Suporta outras linguagens além de C++?"**
> R: "Atualmente só C++, mas a arquitetura foi projetada para ser extensível. Adicionar Python seria relativamente fácil."

**P: "Por que separar em três fases?"**
> R: "Separação de responsabilidades. Cada fase tem um objetivo claro, facilitando manutenção e compreensão."

**P: "O que é Thompson Construction?"**
> R: "É um algoritmo clássico para construir autômatos finitos a partir de expressões regulares. Muito usado em compiladores reais."

---

## 📊 Distribuição de Responsabilidades

### Pessoa A (Introdução + Léxica)
- **Prepara**: Slides 1-8
- **Conhece**: Tokenização, tipos de tokens, erros léxicos
- **Demos**: Nenhuma (teoria)

### Pessoa B (Sintática)
- **Prepara**: Slides 9-14
- **Conhece**: Parsing, gramática, AST, erros sintáticos
- **Demos**: Nenhuma (teoria)

### Pessoa C (Semântica + Erros)
- **Prepara**: Slides 15-20
- **Conhece**: Análise semântica, tabela de símbolos, ErrorCollector
- **Demos**: Nenhuma (teoria)

### Pessoa D (Arquitetura + Demo)
- **Prepara**: Slides 21-32
- **Conhece**: Toda a arquitetura, design patterns, comandos CLI
- **Demos**: Todas (código válido, erros, exportação, NFA)

---

## ⏱️ Cronograma de Ensaios

### Semana 1
- [ ] Segunda: Leitura individual da documentação
- [ ] Quarta: Primeiro ensaio individual (cada um no seu tempo)
- [ ] Sexta: Primeiro ensaio em grupo

### Semana 2
- [ ] Segunda: Ajustes nos slides baseados no primeiro ensaio
- [ ] Quarta: Segundo ensaio em grupo (cronometrado)
- [ ] Sexta: Ensaio final completo

### Dia da Apresentação
- [ ] Chegar 15 minutos antes
- [ ] Testar equipamento (projetor, som, terminal)
- [ ] Fazer último check dos arquivos de demo
- [ ] Respirar fundo e mandar ver! 🚀

---

## 🎬 Exemplo de Transições Suaves

**A → B**:
> "Com os tokens gerados pela análise léxica, passamos para a validação da estrutura. [Pessoa B] vai explicar como o parser funciona."

**B → C**:
> "Agora que a estrutura está validada, precisamos verificar o significado. [Pessoa C] vai mostrar a análise semântica e nosso sistema de erros."

**C → D**:
> "Vimos todas as três fases e como os erros são coletados. [Pessoa D] vai mostrar como tudo se conecta na arquitetura e fazer uma demonstração ao vivo."

---

## 📝 Template de Slide Simples

```
┌─────────────────────────────────────┐
│  [TÍTULO DO SLIDE]                  │
│                                     │
│  • Ponto 1                          │
│  • Ponto 2                          │
│  • Ponto 3                          │
│                                     │
│  [Exemplo visual]                   │
│                                     │
│  Nota importante                    │
└─────────────────────────────────────┘
```

**Dicas para slides**:
- ✅ Máximo 5-6 linhas de texto por slide
- ✅ Use diagramas e exemplos visuais
- ✅ Fonte grande (mínimo 24pt)
- ✅ Cores contrastantes
- ❌ Evite parágrafos longos
- ❌ Não encha de código

---

## 🎉 Mensagem Final

Vocês têm um projeto sólido e bem estruturado! Com boa preparação e ensaios, a apresentação será um sucesso.

**Boa sorte! 🚀**

---

**Este guia cobre**: Roteiros detalhados • Cronogramas • Divisão de responsabilidades • Dicas práticas • Demos ao vivo • Respostas para perguntas

