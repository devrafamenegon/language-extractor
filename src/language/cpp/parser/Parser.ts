import { TokenRow } from '../consts/codes';
import { ErrorCollector } from '../../../error';

export class Parser {
  private tokens: TokenRow[];
  private current = 0;
  private errorCollector: ErrorCollector;

  constructor(tokens: TokenRow[], errorCollector: ErrorCollector) {
    this.tokens = tokens;
    this.errorCollector = errorCollector;
  }

  parse(): void {
    while (!this.isAtEnd()) {
      this.declaration();
    }
  }

  private declaration(): void {
    // Tenta consumir modificadores opcionais (const, static, etc)
    while (this.matchKeyword('const') || this.matchKeyword('static') || 
           this.matchKeyword('volatile') || this.matchKeyword('extern')) {
      // Consome modificadores
    }

    // Verifica se é uma declaração de tipo
    if (this.isTypeKeyword()) {
      this.typeDeclaration();
    } else if (this.peek()?.tipo === 'identificador') {
      // Pode ser namespace, tipo customizado, ou statement
      this.expressionStatement();
    } else if (this.match('delimitador', '{')) {
      // Bloco
      this.block();
    } else if (!this.isAtEnd()) {
      this.advance();
    }
  }

  private isTypeKeyword(): boolean {
    const token = this.peek();
    if (token?.tipo !== 'palavra_reservada') return false;
    
    const typeKeywords = ['int', 'char', 'bool', 'float', 'double', 'void', 
                          'short', 'long', 'unsigned', 'signed'];
    return typeKeywords.includes(token.valor);
  }

  private typeDeclaration(): void {
    // Consome o tipo
    this.advance();

    // Consome ponteiros/referências
    while (this.match('operador', '*') || this.match('operador', '&')) {
      // Consome * ou &
    }

    // Deve ter pelo menos um identificador
    if (!this.match('identificador')) {
      return;
    }

    // Templates (ex: vector<int>)
    if (this.match('operador', '<')) {
      this.consumeUntilBalanced('<', '>');
    }

    // Lista de declarações separadas por vírgula
    while (true) {
      // Array dimensions [N]
      while (this.match('delimitador', '[')) {
        this.consumeUntilDelimiter(']');
      }

      // Função (parâmetros)
      if (this.match('delimitador', '(')) {
        this.consumeUntilDelimiter(')');
        
        // Corpo da função
        if (this.check('delimitador', '{')) {
          this.match('delimitador', '{');
          this.block();
          return;
        }
      }

      // Inicialização
      if (this.matchAnyOperator(['=', '{'])) {
        if (this.previous()?.valor === '{') {
          // Inicialização com lista: {1, 2, 3}
          this.consumeUntilDelimiter('}');
        } else {
          // Inicialização normal: = expr
          this.expression();
        }
      }

      // Se encontrar vírgula, tem mais declarações
      if (this.match('delimitador', ',')) {
        // Próximo declarador
        while (this.match('operador', '*') || this.match('operador', '&')) {
          // Ponteiros
        }
        if (!this.match('identificador')) {
          break;
        }
      } else {
        break;
      }
    }

    // Ponto e vírgula final
    this.match('delimitador', ';');
  }

  private expressionStatement(): void {
    this.expression();
    this.match('delimitador', ';');
  }

  private block(): void {
    while (!this.check('delimitador', '}') && !this.isAtEnd()) {
      this.declaration();
    }
    this.match('delimitador', '}');
  }

  private expression(): void {
    this.ternary();
  }

  private ternary(): void {
    this.assignment();

    if (this.match('operador', '?')) {
      this.expression();
      this.match('operador', ':');
      this.ternary();
    }
  }

  private assignment(): void {
    this.logicalOr();

    // Operadores de atribuição
    const assignOps = ['=', '+=', '-=', '*=', '/=', '%=', 
                       '&=', '|=', '^=', '<<=', '>>='];
    
    if (this.matchAnyOperator(assignOps)) {
      this.assignment();
    }
  }

  private logicalOr(): void {
    this.logicalAnd();
    while (this.match('operador', '||')) {
      this.logicalAnd();
    }
  }

  private logicalAnd(): void {
    this.bitwiseOr();
    while (this.match('operador', '&&')) {
      this.bitwiseOr();
    }
  }

  private bitwiseOr(): void {
    this.bitwiseXor();
    while (this.match('operador', '|')) {
      this.bitwiseXor();
    }
  }

  private bitwiseXor(): void {
    this.bitwiseAnd();
    while (this.match('operador', '^')) {
      this.bitwiseAnd();
    }
  }

  private bitwiseAnd(): void {
    this.equality();
    while (this.match('operador', '&')) {
      this.equality();
    }
  }

  private equality(): void {
    this.comparison();
    while (this.matchAnyOperator(['==', '!='])) {
      this.comparison();
    }
  }

  private comparison(): void {
    this.shift();
    while (this.matchAnyOperator(['<', '>', '<=', '>='])) {
      this.shift();
    }
  }

  private shift(): void {
    this.additive();
    while (this.matchAnyOperator(['<<', '>>'])) {
      this.additive();
    }
  }

  private additive(): void {
    this.multiplicative();
    while (this.matchAnyOperator(['+', '-'])) {
      this.multiplicative();
    }
  }

  private multiplicative(): void {
    this.unary();
    while (this.matchAnyOperator(['*', '/', '%'])) {
      this.unary();
    }
  }

  private unary(): void {
    // Operadores unários prefixos
    if (this.matchAnyOperator(['!', '~', '+', '-', '++', '--', '*', '&'])) {
      this.unary();
      return;
    }

    // Type cast: (type)expr
    if (this.check('delimitador', '(')) {
      const saved = this.current;
      this.advance(); // consome '('
      
      // Verifica se é um cast
      if (this.isTypeKeyword() || this.peek()?.tipo === 'identificador') {
        this.advance();
        while (this.match('operador', '*')) {} // ponteiros
        
        if (this.match('delimitador', ')')) {
          // É um cast, continua com unary
          this.unary();
          return;
        }
      }
      
      // Não é cast, restaura
      this.current = saved;
    }

    this.postfix();
  }

  private postfix(): void {
    this.primary();

    while (true) {
      if (this.matchAnyOperator(['++', '--'])) {
        // Pós-incremento/decremento
        continue;
      } else if (this.match('delimitador', '[')) {
        // Array subscript
        this.expression();
        this.match('delimitador', ']');
      } else if (this.match('delimitador', '(')) {
        // Chamada de função
        this.argumentList();
        this.match('delimitador', ')');
      } else if (this.matchAnyOperator(['.', '->'])) {
        // Acesso a membro
        this.match('identificador');
      } else if (this.match('operador', '::')) {
        // Namespace/scope
        this.match('identificador');
        
        // Template após namespace
        if (this.match('operador', '<')) {
          this.consumeUntilBalanced('<', '>');
        }
      } else {
        break;
      }
    }
  }

  private primary(): void {
    // Literais
    if (this.matchAny(['numero', 'string', 'caractere'])) {
      return;
    }

    // Palavras reservadas literais
    if (this.matchKeyword('true') || this.matchKeyword('false') || 
        this.matchKeyword('nullptr') || this.matchKeyword('NULL')) {
      return;
    }

    // Identificador
    if (this.match('identificador')) {
      return;
    }

    // Expressão entre parênteses
    if (this.match('delimitador', '(')) {
      this.expression();
      this.match('delimitador', ')');
      return;
    }

    // Se não conseguiu consumir nada, avança para evitar loop infinito
    if (!this.isAtEnd()) {
      this.advance();
    }
  }

  private argumentList(): void {
    if (this.check('delimitador', ')')) {
      return;
    }

    do {
      this.expression();
    } while (this.match('delimitador', ','));
  }

  private consumeUntilDelimiter(closing: string): void {
    let depth = 1;
    const opening = this.getOpeningDelimiter(closing);

    while (!this.isAtEnd() && depth > 0) {
      const token = this.peek();
      if (token?.tipo === 'delimitador') {
        if (token.valor === opening) {
          depth++;
        } else if (token.valor === closing) {
          depth--;
          if (depth === 0) {
            this.advance();
            return;
          }
        }
      }
      this.advance();
    }
  }

  private consumeUntilBalanced(opening: string, closing: string): void {
    let depth = 1;

    while (!this.isAtEnd() && depth > 0) {
      const token = this.peek();
      if (token?.tipo === 'operador' || token?.tipo === 'delimitador') {
        if (token.valor === opening) {
          depth++;
        } else if (token.valor === closing) {
          depth--;
          if (depth === 0) {
            this.advance();
            return;
          }
        }
      }
      this.advance();
    }
  }

  private getOpeningDelimiter(closing: string): string {
    const pairs: Record<string, string> = {
      ')': '(',
      '}': '{',
      ']': '['
    };
    return pairs[closing] || closing;
  }

  // Métodos auxiliares
  private match(tipo: TokenRow['tipo'], valor?: string): boolean {
    if (this.check(tipo, valor)) {
      this.advance();
      return true;
    }
    return false;
  }

  private matchKeyword(keyword: string): boolean {
    return this.match('palavra_reservada', keyword);
  }

  private matchAny(tipos: TokenRow['tipo'][]): boolean {
    for (const tipo of tipos) {
      if (this.match(tipo)) {
        return true;
      }
    }
    return false;
  }

  private matchAnyOperator(operators: string[]): boolean {
    for (const op of operators) {
      if (this.match('operador', op)) {
        return true;
      }
    }
    return false;
  }

  private check(tipo: TokenRow['tipo'], valor?: string): boolean {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    if (token?.tipo !== tipo) return false;
    if (valor !== undefined && token?.valor !== valor) return false;
    return true;
  }

  private advance(): TokenRow {
    if (!this.isAtEnd()) this.current++;
    return this.previous()!;
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length;
  }

  private peek(): TokenRow | undefined {
    return this.tokens[this.current];
  }

  private previous(): TokenRow | undefined {
    return this.tokens[this.current - 1];
  }
}

/**
 * Função auxiliar para análise sintática
 */
export function parseSyntax(tokens: TokenRow[], errorCollector: ErrorCollector): void {
  const parser = new Parser(tokens, errorCollector);
  parser.parse();
}
