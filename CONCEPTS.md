# 📚 Guia Conceitual - Language Extractor

> **Entendendo como funciona um compilador de forma didática e conceitual.**

Este documento explica **O QUE** o projeto faz e **POR QUE**, sem entrar em detalhes técnicos de implementação.  
Para detalhes técnicos, consulte [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 📖 Índice

1. [O que é um Compilador?](#-o-que-é-um-compilador)
2. [As Três Fases da Compilação](#-as-três-fases-da-compilação)
3. [Fase 1: Análise Léxica](#-fase-1-análise-léxica-tokenização)
4. [Fase 2: Análise Sintática](#-fase-2-análise-sintática-parsing)
5. [Fase 3: Análise Semântica](#-fase-3-análise-semântica-validação)
6. [Sistema de Detecção de Erros](#-sistema-de-detecção-de-erros)
7. [Fluxo Completo com Exemplo](#-fluxo-completo-com-exemplo)
8. [Como Usar o Projeto](#-como-usar-o-projeto)

---

## 🤔 O que é um Compilador?

Um **compilador** é um programa que traduz código-fonte (escrito por humanos) em código de máquina (executável pelo computador).

### Analogia: Traduzindo um Livro

Imagine que você precisa traduzir um livro do inglês para o português. O processo seria:

1. **Ler as palavras** (reconhecer o que é verbo, substantivo, pontuação)
2. **Entender as frases** (verificar se a gramática está correta)
3. **Compreender o significado** (garantir que as frases fazem sentido no contexto)
4. **Escrever em português** (gerar o resultado final)

Um compilador faz exatamente isso com código!

```
Código C++  →  [Compilador]  →  Código de Máquina
   (input)                          (output)
```

### Front-End vs Back-End

- **Front-End (nosso projeto)**: Entende e valida o código-fonte
- **Back-End**: Gera o código de máquina otimizado

Nosso projeto é um **compilador front-end educacional** que foca nas três primeiras fases.

---

## 🔄 As Três Fases da Compilação

Nosso compilador processa o código em **três fases sequenciais**:

```
┌─────────────────────────────────────────────────────────┐
│                   Código-Fonte C++                      │
│              int main() { return 0; }                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌────────────────────────────────────────────────────────┐
│           FASE 1: Análise Léxica                       │
│           Transforma texto em tokens                   │
│                                                        │
│  "int main() { return 0; }"                           │
│         ↓                                              │
│  [int][main][{][return][0][;][}]                      │
└────────────────────┬───────────────────────────────────┘
                     │
                     ↓
┌────────────────────────────────────────────────────────┐
│           FASE 2: Análise Sintática                    │
│         Verifica estrutura gramatical                  │
│                                                        │
│  [int][main][{][return][0][;][}]                      │
│         ↓                                              │
│  ✓ Estrutura válida (função com corpo)                │
└────────────────────┬───────────────────────────────────┘
                     │
                     ↓
┌────────────────────────────────────────────────────────┐
│           FASE 3: Análise Semântica                    │
│      Valida significado e contexto                     │
│                                                        │
│  ✓ 'main' é declarado corretamente                    │
│  ✓ 'return 0' faz sentido em uma função int           │
└────────────────────┬───────────────────────────────────┘
                     │
                     ↓
┌────────────────────────────────────────────────────────┐
│              ✅ Código Válido!                         │
│         Pronto para próximas fases                     │
└────────────────────────────────────────────────────────┘
```

Cada fase **valida** o código e **reporta erros** se encontrar problemas.

---

## 🔍 Fase 1: Análise Léxica (Tokenização)

### O Que Faz?

Quebra o texto em **pedaços significativos** chamados **tokens**.

### Analogia: Separando Palavras

Imagine esta frase em português:

```
"Ojogadorchutouabolaparaogol"
```

É difícil de ler! A análise léxica faz o equivalente a:

```
"O jogador chutou a bola para o gol"
    ↓
[O] [jogador] [chutou] [a] [bola] [para] [o] [gol]
```

Cada pedaço é classificado:
- **Artigo**: O, a, o
- **Substantivo**: jogador, bola, gol
- **Verbo**: chutou

### Em C++

```cpp
int main() { return 0; }
```

**Tokenização**:

```
Token 1: "int"     → Palavra reservada (tipo)
Token 2: "main"    → Identificador (nome de função)
Token 3: "("       → Delimitador (abre parênteses)
Token 4: ")"       → Delimitador (fecha parênteses)
Token 5: "{"       → Delimitador (abre bloco)
Token 6: "return"  → Palavra reservada (retorno)
Token 7: "0"       → Número (literal inteiro)
Token 8: ";"       → Delimitador (fim de instrução)
Token 9: "}"       → Delimitador (fecha bloco)
```

### Informações Coletadas

Cada token armazena:
- **Tipo**: O que ele representa (número, identificador, operador...)
- **Valor**: O texto original ("main", "123", "+")
- **Posição**: Linha e coluna onde aparece (para relatórios de erro)

### Exemplo de Saída

| Tipo              | Código | Valor  | Linha | Coluna |
|-------------------|--------|--------|-------|--------|
| palavra_reservada | 101    | int    | 1     | 1      |
| identificador     | 201    | main   | 1     | 5      |
| delimitador       | 301    | (      | 1     | 9      |
| delimitador       | 302    | )      | 1     | 10     |
| delimitador       | 303    | {      | 1     | 12     |
| palavra_reservada | 115    | return | 1     | 14     |
| numero            | 401    | 0      | 1     | 21     |
| delimitador       | 304    | ;      | 1     | 22     |
| delimitador       | 305    | }      | 1     | 24     |

### Erros Detectados

A análise léxica detecta problemas como:

❌ **Caractere Inválido**
```cpp
int x = 10 @ 5;  // '@' não é válido em C++
         //  ^--- ERRO: Caractere inválido
```

❌ **String Não Fechada**
```cpp
printf("Hello World
       //  ^--- ERRO: String não foi fechada
```

❌ **Comentário Não Fechado**
```cpp
/* Este comentário nunca fecha...
int main() {
  return 0;
}
// ^--- ERRO: Comentário /* */ não foi fechado
```

---

## 📝 Fase 2: Análise Sintática (Parsing)

### O Que Faz?

Verifica se os tokens formam uma **estrutura válida** segundo as regras da gramática da linguagem.

### Analogia: Verificando a Gramática

Em português, você não pode dizer:

```
❌ "Cachorro late o rapidamente"  → Gramática errada
✅ "O cachorro late rapidamente"  → Gramática correta
```

A análise sintática faz o mesmo com código!

### Em C++

O parser verifica se a sequência de tokens forma **declarações válidas**:

✅ **Válido**:
```cpp
int x = 10;
```
```
[int] [x] [=] [10] [;]
  ↓    ↓   ↓   ↓   ↓
[tipo][id][op][num][fim]  → Declaração de variável válida ✓
```

❌ **Inválido**:
```cpp
int x = ;
```
```
[int] [x] [=] [;]
  ↓    ↓   ↓   ↓
[tipo][id][op][fim]  → Falta valor! ✗
```

### Estruturas Verificadas

O parser reconhece e valida:

1. **Declarações de Variáveis**
   ```cpp
   int x = 10;
   float y;
   ```

2. **Declarações de Funções**
   ```cpp
   int soma(int a, int b) {
     return a + b;
   }
   ```

3. **Expressões**
   ```cpp
   x = a + b * c;
   ```

4. **Blocos de Código**
   ```cpp
   {
     int x = 10;
     return x;
   }
   ```

### Erros Detectados

❌ **Parêntese Não Fechado**
```cpp
int main( {
       //  ^--- ERRO: Esperado ')', encontrado '{'
```

❌ **Ponto-e-Vírgula Faltando**
```cpp
int x = 10
return x;
        //  ^--- ERRO: Esperado ';' após declaração
```

❌ **Token Inesperado**
```cpp
int main() {
  return 0 }
        //  ^--- ERRO: Esperado ';', encontrado '}'
```

❌ **Chave Não Fechada**
```cpp
int main() {
  return 0;
  // ^--- ERRO: Bloco não foi fechado (falta '}')
```

---

## 🧠 Fase 3: Análise Semântica (Validação)

### O Que Faz?

Verifica se o código **faz sentido** no contexto, mesmo que a gramática esteja correta.

### Analogia: Verificando o Significado

Em português, esta frase é gramaticalmente correta, mas não faz sentido:

```
✅ Gramática: "O gato bebeu o vento com o chapéu"
❌ Significado: Gatos não bebem vento!
```

A análise semântica encontra esse tipo de erro em código.

### Em C++

✅ **Válido**:
```cpp
int x = 10;
printf("%d", x);  // ✓ 'x' foi declarado antes de ser usado
```

❌ **Inválido** (gramática OK, mas semântica errada):
```cpp
printf("%d", x);  // ✗ 'x' não foi declarado!
int x = 10;
```

### O Que é Verificado?

#### 1. **Declaração de Identificadores**

Toda variável/função deve ser **declarada antes de usar**:

```cpp
int main() {
  x = 10;        // ❌ ERRO: 'x' não foi declarado
  int x;         // Declaração veio tarde demais
  return 0;
}
```

Correto:
```cpp
int main() {
  int x;         // ✅ Declaração primeiro
  x = 10;        // ✅ Uso depois
  return 0;
}
```

#### 2. **Redeclaração**

Um identificador **não pode ser declarado duas vezes no mesmo escopo**:

```cpp
int main() {
  int x = 10;
  int x = 20;    // ❌ ERRO: 'x' já foi declarado
  return 0;
}
```

#### 3. **Escopo**

Variáveis só existem dentro do bloco onde foram declaradas:

```cpp
int main() {
  {
    int x = 10;  // ✅ Declarado aqui
  }
  printf("%d", x);  // ❌ ERRO: 'x' não existe neste escopo
  return 0;
}
```

#### 4. **Funções**

Funções devem ser declaradas antes de serem chamadas:

```cpp
int main() {
  soma(1, 2);    // ❌ ERRO: 'soma' não foi declarada
  return 0;
}

int soma(int a, int b) {  // Declaração veio depois
  return a + b;
}
```

### Erros Detectados

❌ **Variável Não Declarada**
```cpp
int main() {
  count = 10;
  // ^--- ERRO: 'count' não foi declarado neste escopo
  return 0;
}
```

❌ **Redeclaração**
```cpp
int x = 10;
int x = 20;
  // ^--- ERRO: 'x' já foi declarado anteriormente
```

❌ **Função Não Declarada**
```cpp
int main() {
  calcular();
  // ^--- ERRO: Função 'calcular' não foi declarada
  return 0;
}
```

---

## 🚨 Sistema de Detecção de Erros

### Como Funciona?

O compilador coleta **todos os erros** de todas as fases e apresenta um **relatório unificado**.

### Filosofia: "Não Pare no Primeiro Erro"

Diferente de alguns compiladores que param no primeiro erro, nosso sistema:

✅ **Continua analisando** mesmo após encontrar erros  
✅ **Coleta múltiplos erros** de uma vez  
✅ **Reporta todos juntos** no final  

**Por quê?** Para economizar tempo do desenvolvedor!

### Exemplo de Relatório

**Código com múltiplos erros**:
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
  - 2:10    String não fechada | printf("Hello World

[ANÁLISE SINTÁTICA] 1 erro(s)
  - 1:11    Token inesperado | "(" (esperado=); encontrado={)

[ANÁLISE SEMÂNTICA] 1 erro(s)
  - 3:3     Identificador "x" não foi declarado | x = 10;

TOTAL GERAL: 3 erro(s)
```

### Formato do Relatório

Cada erro mostra:
- **Fase**: Onde foi detectado (léxica, sintática, semântica)
- **Posição**: Linha e coluna exata
- **Tipo**: O que deu errado
- **Contexto**: Trecho do código com o problema
- **Dica**: O que era esperado (quando aplicável)

---

## 🎬 Fluxo Completo com Exemplo

Vamos acompanhar a jornada de um arquivo C++ através do compilador!

### 📄 Código de Entrada

**Arquivo**: `hello.cpp`
```cpp
#include <stdio.h>

int main() {
  printf("Hello, World!\n");
  return 0;
}
```

---

### **Etapa 0: Pré-Processamento** 🧹

Antes da análise, o código passa por uma limpeza:

1. **Remove BOM** (Byte Order Mark UTF-8)
2. **Junta linhas** que terminam com `\`
3. **Remove comentários** (mas preserva as posições)

**Antes**:
```cpp
// Este é um comentário
int main() { /* inline */ return 0; }
```

**Depois**:
```cpp
                        
int main() {              return 0; }
```

> **Importante**: Os espaços substituem os comentários para manter as posições corretas!

---

### **Fase 1: Análise Léxica** 🔍

**Entrada**: Texto limpo  
**Saída**: Lista de tokens

**Tokens Gerados**:

| # | Tipo              | Valor  | Linha | Coluna |
|---|-------------------|--------|-------|--------|
| 1 | palavra_reservada | int    | 3     | 1      |
| 2 | identificador     | main   | 3     | 5      |
| 3 | delimitador       | (      | 3     | 9      |
| 4 | delimitador       | )      | 3     | 10     |
| 5 | delimitador       | {      | 3     | 12     |
| 6 | identificador     | printf | 4     | 3      |
| 7 | delimitador       | (      | 4     | 9      |
| 8 | string            | "Hello, World!\n" | 4 | 10 |
| 9 | delimitador       | )      | 4     | 28     |
| 10| delimitador       | ;      | 4     | 29     |
| 11| palavra_reservada | return | 5     | 3      |
| 12| numero            | 0      | 5     | 10     |
| 13| delimitador       | ;      | 5     | 11     |
| 14| delimitador       | }      | 6     | 1      |

**Resultado**: ✅ 14 tokens reconhecidos, 0 erros

---

### **Fase 2: Análise Sintática** 📝

**Entrada**: Lista de tokens  
**Saída**: Validação da estrutura

**O que o parser verifica**:

1. ✅ `int main()` → Declaração de função válida
2. ✅ `{ ... }` → Bloco de código balanceado
3. ✅ `printf(...)` → Chamada de função válida
4. ✅ `return 0;` → Statement de retorno válido

**Resultado**: ✅ Estrutura sintática correta, 0 erros

---

### **Fase 3: Análise Semântica** 🧠

**Entrada**: Tokens validados  
**Saída**: Validação de significado

**O que o analisador verifica**:

1. ✅ `main` → Declarado como função (OK)
2. ⚠️ `printf` → Função externa (assumido OK, seria erro sem `#include`)
3. ✅ `return 0` → Tipo compatível com `int main()` (OK)

**Resultado**: ✅ Semântica válida, 0 erros

---

### **Saída Final** 📤

#### **Modo Console** 🖥️

```
Token: int       | Código: 101 | Linha: 3 | Coluna: 1
Token: main      | Código: 201 | Linha: 3 | Coluna: 5
Token: (         | Código: 301 | Linha: 3 | Coluna: 9
...
```

#### **Modo JSON** 📄

```json
[
  {
    "tipo": "palavra_reservada",
    "codigo": 101,
    "valor": "int",
    "linha": 3,
    "coluna": 1
  },
  {
    "tipo": "identificador",
    "codigo": 201,
    "valor": "main",
    "linha": 3,
    "coluna": 5
  }
]
```

#### **Modo CSV** 📊

```csv
"token","codigo","valor","linha","coluna"
"palavra_reservada","101","int","3","1"
"identificador","201","main","3","5"
```

---

### 🔴 E Se Tivesse Erros?

**Código com erro**:
```cpp
int main() {
  printf("Hello World
  x = 10;
  return 0;
}
```

**Saída**:
```
========== RELATÓRIO DE ERROS ==========

[ANÁLISE LÉXICA] 1 erro(s)
  - 2:10    String não fechada
    printf("Hello World
           ^--- Esperado '"' antes do fim da linha

[ANÁLISE SEMÂNTICA] 1 erro(s)
  - 3:3     Identificador "x" não foi declarado
    x = 10;
    ^--- 'x' não existe neste escopo

TOTAL GERAL: 2 erro(s)

❌ Compilação falhou com 2 erro(s)
```

**Exit code**: `1` (indica falha)

---

## 💻 Como Usar o Projeto

### 1️⃣ Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd language-extractor

# Instale as dependências
npm install
```

### 2️⃣ Análise Básica

```bash
# Analisa e mostra tokens no console
npm run dev -- samples/hello.cpp
```

**Saída**:
```
Token: int       | Código: 101 | Linha: 1 | Coluna: 1
Token: main      | Código: 201 | Linha: 1 | Coluna: 5
...

✅ Análise concluída: 14 tokens, 0 erros
```

### 3️⃣ Exportar JSON

```bash
# Gera arquivo results/hello.tokens.json
npm run dev -- --json samples/hello.cpp
```

### 4️⃣ Exportar CSV

```bash
# Gera arquivo results/hello.tokens.csv
npm run dev -- --csv samples/hello.cpp
```

### 5️⃣ Usar Tokenizador NFA

O projeto oferece **duas estratégias de tokenização**:

- **Manual** (padrão): Usa loops e regex simples
- **NFA** (avançado): Usa autômatos finitos (Thompson Construction)

```bash
# Usa tokenizador NFA
npm run dev -- --afn samples/hello.cpp

# Combina com exportação
npm run dev -- --afn --json samples/hello.cpp
```

**Qual usar?**
- **Manual**: Mais simples, educacional, fácil de entender
- **NFA**: Mais robusto, teórico, usado em compiladores reais

### 6️⃣ Analisar Código com Erros

```bash
# Cria arquivo com erro
echo 'int main() { x = 10; }' > test.cpp

# Analisa
npm run dev -- test.cpp
```

**Saída**:
```
========== RELATÓRIO DE ERROS ==========

[ANÁLISE SEMÂNTICA] 1 erro(s)
  - 1:14    Identificador "x" não foi declarado
    int main() { x = 10; }
                 ^--- 'x' não existe neste escopo

TOTAL GERAL: 1 erro(s)

❌ Compilação falhou com 1 erro(s)
```

### 7️⃣ Executar Testes

```bash
# Executa todos os testes
npm test

# Modo watch (re-executa ao salvar)
npm run test:watch

# Gera relatório de cobertura
npm run test:coverage
```

---

## 🎯 Casos de Uso

### Para Estudantes

Entenda **como compiladores funcionam** na prática:
- Veja tokens sendo gerados
- Entenda erros léxicos, sintáticos e semânticos
- Compare estratégias (Manual vs NFA)

### Para Professores

Use como **material didático**:
- Código bem documentado
- Exemplos práticos
- Fácil de modificar e experimentar

### Para Desenvolvedores

Aprenda sobre:
- Design patterns (Strategy, Pipeline, Collector)
- Arquitetura de compiladores
- Autômatos finitos (NFA)
- Clean Code na prática

---

## 🎓 Conceitos-Chave

### 1. Token

**Definição**: Unidade léxica mínima com significado.

**Exemplos**:
- `int` → Palavra reservada
- `x` → Identificador
- `+` → Operador
- `123` → Número

### 2. Lexema

**Definição**: Texto original do token.

**Exemplo**:
- Token: IDENTIFIER
- Lexema: `"variavel"`

### 3. Gramática

**Definição**: Regras que definem a estrutura válida da linguagem.

**Exemplo**:
```
declaracao → tipo identificador ';'
tipo       → 'int' | 'float' | 'void'
```

### 4. Escopo

**Definição**: Região do código onde um identificador é válido.

**Exemplo**:
```cpp
int main() {
  int x = 10;     // x válido aqui
  {
    int y = 20;   // y válido só neste bloco
  }
  // y não existe mais aqui
}
```

### 5. Autômato Finito (NFA)

**Definição**: Máquina abstrata que reconhece padrões.

**Uso**: Base teórica para tokenizadores robustos.

---

## 🚀 Próximos Passos

Depois de entender os conceitos:

1. **Leia o código** - Navegue pelos arquivos para ver a implementação
2. **Execute exemplos** - Use os arquivos em `samples/`
3. **Modifique** - Adicione novas palavras-chave, operadores
4. **Crie testes** - Valide suas modificações
5. **Aprofunde** - Leia [ARCHITECTURE.md](ARCHITECTURE.md) para detalhes técnicos

---

## 📚 Recursos Adicionais

### Documentação

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitetura técnica detalhada
- **[README.md](README.md)** - Guia de uso e referência rápida

### Livros Recomendados

- **"Compiladores: Princípios, Técnicas e Ferramentas"** (Dragon Book)
- **"Modern Compiler Implementation"** (Tiger Book)
- **"Engineering a Compiler"** (Cooper & Torczon)

### Conceitos para Estudar

- Autômatos Finitos (DFA/NFA)
- Expressões Regulares
- Análise Sintática (LL, LR, LALR)
- Tabelas de Símbolos
- Árvores Sintáticas Abstratas (AST)

---

## ❓ Perguntas Frequentes

### Por que três fases?

Cada fase tem uma responsabilidade específica:
- **Léxica**: Reconhecer pedaços de texto
- **Sintática**: Validar estrutura
- **Semântica**: Garantir significado

Separar facilita manutenção e compreensão.

### Manual vs NFA: qual é melhor?

**Manual**: Mais simples, educacional  
**NFA**: Mais robusto, teórico

Para aprender, comece com Manual. Para entender teoria, explore NFA.

### Onde estão os arquivos gerados?

Todos os arquivos são salvos em `results/`:
- `arquivo.tokens.json`
- `arquivo.tokens.csv`
- `arquivo.errors.json`

### Como adicionar suporte para Python/Java?

O projeto foi projetado para ser extensível. Você precisaria:
1. Criar pasta `src/languages/python/`
2. Implementar lexer, parser e semantic analyzer
3. Definir a gramática (keywords, operators)
4. Usar a mesma infraestrutura de `scanning/`

---

## ✅ Resumo

Este projeto demonstra as **três fases fundamentais** de um compilador:

1. **🔍 Análise Léxica**: Quebra texto em tokens
2. **📝 Análise Sintática**: Valida estrutura gramatical
3. **🧠 Análise Semântica**: Verifica significado e contexto

Cada fase:
- ✅ Tem responsabilidade única
- ✅ Detecta erros específicos
- ✅ Reporta problemas de forma clara
- ✅ É independente e testável

**Objetivo**: Ensinar como compiladores funcionam de forma prática e acessível! 🎓

---

**🎉 Agora você está pronto para explorar o código!**

Comece executando exemplos em `samples/` e veja o compilador em ação.  
Dúvidas técnicas? Consulte [ARCHITECTURE.md](ARCHITECTURE.md).

