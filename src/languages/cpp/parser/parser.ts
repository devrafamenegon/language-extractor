/**
 * Parser recursivo descendente básico para C/C++.
 * Verifica estruturas sintáticas básicas e detecta erros sintáticos.
 */
import { TokenRow } from '../tokens/codes';
import { ErrorCollector, SyntacticError } from '../../../errors';
import { SyntacticErrorType } from '../errors/ErrorTypes';

export class Parser {
  private tokens: TokenRow[];
  private current = 0;
  private errorCollector: ErrorCollector;

  constructor(tokens: TokenRow[], errorCollector: ErrorCollector) {
    this.tokens = tokens;
    this.errorCollector = errorCollector;
  }

  /**
   * Analisa o programa completo.
   */
  parse(): void {
    while (!this.isAtEnd()) {
      this.declaration();
    }
    
    // Verifica parênteses, chaves e colchetes não fechados
    this.checkUnclosedDelimiters();
  }

  /**
   * Processa uma declaração (variável, função, etc.).
   */
  private declaration(): void {
    if (this.match('palavra_reservada')) {
      // Tipo (int, char, etc.)
      const typeToken = this.previous();
      if (!typeToken) return;
      
      // Espera identificador
      if (!this.match('identificador')) {
        this.error(
          this.peek() || typeToken,
          'token_faltando',
          'Esperado identificador após tipo',
          'identificador'
        );
        return;
      }
      
      const idToken = this.previous();
      
      // Pode ser declaração de variável com inicialização ou função
      if (this.match('delimitador', '(')) {
        // Possível função
        this.expression(); // Parâmetros/argumentos
      } else if (this.match('operador', '=')) {
        // Inicialização
        this.expression();
      }
      
      // Espera ponto e vírgula para declaração de variável
      if (!this.match('delimitador', ';')) {
        // Não é obrigatório se for função ou expressão
        if (this.peek()?.tipo === 'delimitador' && this.peek()?.valor === '{') {
          // Provavelmente é uma função
          this.block();
        }
      }
    } else {
      this.expression();
    }
  }

  /**
   * Processa uma expressão.
   */
  private expression(): void {
    this.equality();
  }

  /**
   * Processa expressões de igualdade (==, !=).
   */
  private equality(): void {
    this.comparison();
    while (this.match('operador', '==') || this.match('operador', '!=')) {
      this.comparison();
    }
  }

  /**
   * Processa expressões de comparação (<, >, <=, >=).
   */
  private comparison(): void {
    this.term();
    while (
      this.match('operador', '<') ||
      this.match('operador', '>') ||
      this.match('operador', '<=') ||
      this.match('operador', '>=')
    ) {
      this.term();
    }
  }

  /**
   * Processa termos (+, -).
   */
  private term(): void {
    this.factor();
    while (this.match('operador', '+') || this.match('operador', '-')) {
      this.factor();
    }
  }

  /**
   * Processa fatores (*, /).
   */
  private factor(): void {
    this.unary();
    while (this.match('operador', '*') || this.match('operador', '/')) {
      this.unary();
    }
  }

  /**
   * Processa operadores unários.
   */
  private unary(): void {
    if (this.match('operador', '-') || this.match('operador', '!')) {
      this.unary();
    } else {
      this.primary();
    }
  }

  /**
   * Processa primitivos (literais, identificadores, parênteses).
   */
  private primary(): void {
    if (this.match('numero')) return;
    if (this.match('string')) return;
    if (this.match('caractere')) return;
    
    if (this.match('identificador')) return;
    
    if (this.match('delimitador', '(')) {
      this.expression();
      if (!this.match('delimitador', ')')) {
        this.error(
          this.peek() || this.previous()!,
          'parentese_nao_fechado',
          'Parêntese não foi fechado',
          ')'
        );
      }
      return;
    }

    // Token inesperado
    const token = this.peek();
    if (token) {
      this.error(
        token,
        'token_inesperado',
        `Token inesperado: ${token.valor}`,
        undefined,
        token.valor
      );
    }
    this.advance();
  }

  /**
   * Processa um bloco de código entre chaves.
   */
  private block(): void {
    if (!this.match('delimitador', '{')) {
      return;
    }
    
    while (!this.check('delimitador', '}') && !this.isAtEnd()) {
      this.declaration();
    }
    
    if (!this.match('delimitador', '}')) {
      const token = this.peek() || this.previous();
      if (token) {
        this.error(
          token,
          'chave_nao_fechada',
          'Chave não foi fechada',
          '}'
        );
      }
    }
  }

  /**
   * Verifica parênteses, chaves e colchetes não fechados.
   */
  private checkUnclosedDelimiters(): void {
    const stack: Array<{ token: TokenRow; type: '(' | '{' | '[' }> = [];
    
    for (const token of this.tokens) {
      if (token.tipo === 'delimitador') {
        if (token.valor === '(' || token.valor === '{' || token.valor === '[') {
          stack.push({
            token,
            type: token.valor as '(' | '{' | '[',
          });
        } else if (token.valor === ')' || token.valor === '}' || token.valor === ']') {
          if (stack.length === 0) {
            this.error(
              token,
              'token_inesperado',
              `Delimitador de fechamento inesperado: ${token.valor}`,
              undefined,
              token.valor
            );
            continue;
          }
          
          const last = stack.pop()!;
          const expected: Record<string, string> = {
            '(': ')',
            '{': '}',
            '[': ']',
          };
          
          if (token.valor !== expected[last.type]) {
            this.error(
              token,
              'token_inesperado',
              `Esperado ${expected[last.type]}, encontrado ${token.valor}`,
              expected[last.type],
              token.valor
            );
          }
        }
      }
    }
    
    // Reporta delimitadores não fechados
    for (const item of stack) {
      const expected: Record<string, string> = {
        '(': ')',
        '{': '}',
        '[': ']',
      };
      this.error(
        item.token,
        item.type === '(' ? 'parentese_nao_fechado' : item.type === '{' ? 'chave_nao_fechada' : 'colchete_nao_fechado',
        `Delimitador ${item.type} não foi fechado`,
        expected[item.type]
      );
    }
  }

  /**
   * Verifica se o token atual corresponde ao tipo e valor especificados.
   */
  private check(tipo: TokenRow['tipo'], valor?: string): boolean {
    if (this.isAtEnd()) return false;
    const token = this.tokens[this.current];
    if (!token || token.tipo !== tipo) return false;
    if (valor !== undefined && token.valor !== valor) return false;
    return true;
  }

  /**
   * Avança e retorna true se o token corresponder, senão retorna false sem avançar.
   */
  private match(tipo: TokenRow['tipo'], valor?: string): boolean {
    if (this.check(tipo, valor)) {
      this.advance();
      return true;
    }
    return false;
  }

  /**
   * Avança para o próximo token.
   */
  private advance(): TokenRow {
    if (!this.isAtEnd()) this.current++;
    return this.previous()!;
  }

  /**
   * Verifica se chegou ao final dos tokens.
   */
  private isAtEnd(): boolean {
    return this.current >= this.tokens.length;
  }

  /**
   * Retorna o token atual sem avançar.
   */
  private peek(): TokenRow | undefined {
    if (this.isAtEnd()) return undefined;
    return this.tokens[this.current];
  }

  /**
   * Retorna o token anterior.
   */
  private previous(): TokenRow | undefined {
    if (this.current === 0) return undefined;
    return this.tokens[this.current - 1];
  }

  /**
   * Adiciona um erro sintático.
   */
  private error(
    token: TokenRow,
    tipo: SyntacticError['tipo'],
    mensagem: string,
    esperado?: string,
    encontrado?: string
  ): void {
    this.errorCollector.addSyntactic({
      fase: 'sintatico',
      tipo,
      mensagem,
      linha: token.linha,
      coluna: token.coluna,
      trecho: token.valor,
      esperado,
      encontrado: encontrado || token.valor,
    });
  }
}

/**
 * Analisa sintaticamente uma lista de tokens.
 */
export function parseSyntax(tokens: TokenRow[], errorCollector: ErrorCollector): void {
  const parser = new Parser(tokens, errorCollector);
  parser.parse();
}


