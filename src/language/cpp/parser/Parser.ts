import { TokenRow } from '../consts/codes';
import { ErrorCollector, SyntacticError } from '../../../error';

type DelimiterType = '(' | '{' | '[';
type DelimiterStack = Array<{ token: TokenRow; type: DelimiterType }>;

const DELIMITER_PAIRS: Record<DelimiterType, string> = {
  '(': ')',
  '{': '}',
  '[': ']',
};

const DELIMITER_ERROR_TYPES: Record<DelimiterType, SyntacticError['tipo']> = {
  '(': 'parentese_nao_fechado',
  '{': 'chave_nao_fechada',
  '[': 'colchete_nao_fechado',
};

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
    this.validateAllDelimiters();
  }

  private declaration(): void {
    this.match('palavra_reservada')
      ? this.handleTypeDeclaration()
      : this.expression();
  }

  private handleTypeDeclaration(): void {
    const typeToken = this.previous();
    if (!typeToken) return;

    if (!this.match('identificador')) {
      this.reportMissingIdentifier(typeToken);
      return;
    }

    this.processDeclarationType();
    this.finalizeDeclaration();
  }

  private processDeclarationType(): void {
    if (this.match('delimitador', '(')) {
      this.expression();
    } else if (this.match('operador', '=')) {
      this.expression();
    }
  }

  private finalizeDeclaration(): void {
    if (!this.match('delimitador', ';') && this.isNextTokenOpenBrace()) {
      this.block();
    }
  }

  private isNextTokenOpenBrace(): boolean {
    const next = this.peek();
    return next?.tipo === 'delimitador' && next?.valor === '{';
  }

  private block(): void {
    if (!this.match('delimitador', '{')) return;

    while (!this.check('delimitador', '}') && !this.isAtEnd()) {
      this.declaration();
    }

    this.expectDelimiter('}', 'chave_nao_fechada', 'Chave não foi fechada');
  }

  private expression(): void {
    this.equality();
  }

  private equality(): void {
    this.parseBinaryOperators(
      () => this.comparison(),
      ['==', '!=']
    );
  }

  private comparison(): void {
    this.parseBinaryOperators(
      () => this.term(),
      ['<', '>', '<=', '>=']
    );
  }

  private term(): void {
    this.parseBinaryOperators(
      () => this.factor(),
      ['+', '-']
    );
  }

  private factor(): void {
    this.parseBinaryOperators(
      () => this.unary(),
      ['*', '/']
    );
  }

  private parseBinaryOperators(parseOperand: () => void, operators: string[]): void {
    parseOperand();
    while (operators.some(op => this.match('operador', op))) {
      parseOperand();
    }
  }

  private unary(): void {
    (this.match('operador', '-') || this.match('operador', '!'))
      ? this.unary()
      : this.primary();
  }

  private primary(): void {
    if (this.matchAny(['numero', 'string', 'caractere', 'identificador'])) {
      return;
    }

    if (this.match('delimitador', '(')) {
      this.expression();
      this.expectDelimiter(')', 'parentese_nao_fechado', 'Parêntese não foi fechado');
      return;
    }

    this.reportUnexpectedToken();
  }

  private matchAny(types: TokenRow['tipo'][]): boolean {
    return types.some(type => this.match(type));
  }

  private expectDelimiter(
    delimiter: string,
    errorType: SyntacticError['tipo'],
    message: string
  ): void {
    if (!this.match('delimitador', delimiter)) {
      const token = this.peek() || this.previous();
      if (token) {
        this.error(token, errorType, message, delimiter);
      }
    }
  }

  private validateAllDelimiters(): void {
    const stack: DelimiterStack = [];

    this.tokens
      .filter(token => token.tipo === 'delimitador')
      .forEach(token => this.processDelimiter(token, stack));

    this.reportUnclosedDelimiters(stack);
  }

  private processDelimiter(token: TokenRow, stack: DelimiterStack): void {
    const value = token.valor;

    if (this.isOpeningDelimiter(value)) {
      stack.push({ token, type: value as DelimiterType });
    } else if (this.isClosingDelimiter(value)) {
      this.validatePair(token, stack);
    }
  }

  private isOpeningDelimiter(value: string): boolean {
    return ['(', '{', '['].includes(value);
  }

  private isClosingDelimiter(value: string): boolean {
    return [')', '}', ']'].includes(value);
  }

  private validatePair(token: TokenRow, stack: DelimiterStack): void {
    if (stack.length === 0) {
      this.reportUnexpectedClosing(token);
      return;
    }

    const opening = stack.pop()!;
    const expected = DELIMITER_PAIRS[opening.type];

    if (token.valor !== expected) {
      this.reportMismatchedDelimiter(token, expected);
    }
  }

  private reportUnclosedDelimiters(stack: DelimiterStack): void {
    stack.forEach(({ token, type }) => {
      this.error(
        token,
        DELIMITER_ERROR_TYPES[type],
        `Delimitador ${type} não foi fechado`,
        DELIMITER_PAIRS[type]
      );
    });
  }

  private reportMissingIdentifier(typeToken: TokenRow): void {
    this.error(
      this.peek() || typeToken,
      'token_faltando',
      'Esperado identificador após tipo',
      'identificador'
    );
  }

  private reportUnexpectedToken(): void {
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

  private reportUnexpectedClosing(token: TokenRow): void {
    this.error(
      token,
      'token_inesperado',
      `Delimitador de fechamento inesperado: ${token.valor}`,
      undefined,
      token.valor
    );
  }

  private reportMismatchedDelimiter(token: TokenRow, expected: string): void {
    this.error(
      token,
      'token_inesperado',
      `Esperado ${expected}, encontrado ${token.valor}`,
      expected,
      token.valor
    );
  }

  private check(tipo: TokenRow['tipo'], valor?: string): boolean {
    if (this.isAtEnd()) return false;

    const token = this.tokens[this.current];
    if (!token || token.tipo !== tipo) return false;
    if (valor !== undefined && token.valor !== valor) return false;

    return true;
  }

  private match(tipo: TokenRow['tipo'], valor?: string): boolean {
    if (this.check(tipo, valor)) {
      this.advance();
      return true;
    }
    return false;
  }

  private advance(): TokenRow {
    if (!this.isAtEnd()) this.current++;
    return this.previous()!;
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length;
  }

  private peek(): TokenRow | undefined {
    return this.isAtEnd() ? undefined : this.tokens[this.current];
  }

  private previous(): TokenRow | undefined {
    return this.current === 0 ? undefined : this.tokens[this.current - 1];
  }

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

export function parseSyntax(tokens: TokenRow[], errorCollector: ErrorCollector): void {
  new Parser(tokens, errorCollector).parse();
}

