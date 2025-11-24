import { TokenRow } from '../consts/codes';
import { ErrorCollector, SemanticError } from '../../../error';
import { SemanticErrorType } from '../types';

interface Symbol {
  nome: string;
  tipo: 'variavel' | 'funcao' | 'tipo';
  linha: number;
  coluna: number;
}

const TYPE_KEYWORDS = new Set([
  'int', 'char', 'float', 'double', 'void', 'bool', 
  'short', 'long', 'unsigned', 'signed'
]);

const CPP_KEYWORDS = new Set([
  'if', 'else', 'while', 'for', 'return', 'break', 'continue',
  'int', 'char', 'float', 'double', 'void', 'bool',
  'const', 'static', 'extern', 'auto', 'struct', 'class',
  'namespace', 'using', 'include', 'define',
]);

const SCOPE_PROXIMITY_THRESHOLD = 10;

export class SemanticAnalyzer {
  private tokens: TokenRow[];
  private errorCollector: ErrorCollector;
  private symbols = new Map<string, Symbol>();

  constructor(tokens: TokenRow[], errorCollector: ErrorCollector) {
    this.tokens = tokens;
    this.errorCollector = errorCollector;
  }

  analyze(): void {
    this.processDeclarations();
    this.validateIdentifierUsage();
  }

  private processDeclarations(): void {
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      
      if (this.isTypeDeclaration(token)) {
        i = this.registerDeclaration(i);
      }
    }
  }

  private isTypeDeclaration(token: TokenRow | undefined): boolean {
    return token?.tipo === 'palavra_reservada' && TYPE_KEYWORDS.has(token.valor);
  }

  private registerDeclaration(startIndex: number): number {
    const typeToken = this.tokens[startIndex];
    if (!typeToken) return startIndex;

    const identifierIndex = this.findIdentifierAfterType(startIndex);
    const idToken = this.tokens[identifierIndex];
    
    if (!idToken || idToken.tipo !== 'identificador') {
      return identifierIndex;
    }

    this.checkForRedeclaration(idToken);
    this.addSymbol(idToken, identifierIndex);

    return this.findDeclarationEnd(identifierIndex);
  }

  private findIdentifierAfterType(startIndex: number): number {
    let i = startIndex + 1;
    
    while (i < this.tokens.length && this.isPointerOperator(this.tokens[i])) {
      i++;
    }
    
    return i;
  }

  private isPointerOperator(token: TokenRow | undefined): boolean {
    return token?.tipo === 'operador' && token?.valor === '*';
  }

  private checkForRedeclaration(idToken: TokenRow): void {
    const existing = this.symbols.get(idToken.valor);
    
    if (existing && this.isInSameScope(existing.linha, idToken.linha)) {
      this.reportRedeclaration(idToken);
    }
  }

  private isInSameScope(line1: number, line2: number): boolean {
    return Math.abs(line1 - line2) < SCOPE_PROXIMITY_THRESHOLD;
  }

  private addSymbol(idToken: TokenRow, identifierIndex: number): void {
    const isFunction = this.determineIfFunction(identifierIndex);
    
    this.symbols.set(idToken.valor, {
      nome: idToken.valor,
      tipo: isFunction ? 'funcao' : 'variavel',
      linha: idToken.linha,
      coluna: idToken.coluna,
    });
  }

  private determineIfFunction(identifierIndex: number): boolean {
    const nextDelimiters = this.findNextDelimiters(identifierIndex);
    return nextDelimiters.includes('(') || nextDelimiters.includes('{');
  }

  private findNextDelimiters(startIndex: number): string[] {
    const delimiters: string[] = [];
    
    for (let i = startIndex + 1; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      
      if (token?.tipo === 'delimitador') {
        delimiters.push(token.valor);
        
        if (['(', ';', '{'].includes(token.valor)) {
          break;
        }
      }
    }
    
    return delimiters;
  }

  private findDeclarationEnd(identifierIndex: number): number {
    for (let i = identifierIndex + 1; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      
      if (token?.tipo === 'delimitador' && ['(', ';', '{'].includes(token.valor)) {
        return i;
      }
    }
    
    return identifierIndex;
  }

  private validateIdentifierUsage(): void {
    const usedIdentifiers = this.collectUsedIdentifiers();
    const undeclared = this.findUndeclaredIdentifiers(usedIdentifiers);
    
    undeclared.forEach(identifier => this.reportUndeclared(identifier));
  }

  private collectUsedIdentifiers(): Set<string> {
    return this.tokens
      .map((token, index) => ({ token, index }))
      .filter(({ token }) => token?.tipo === 'identificador')
      .filter(({ index }) => !this.isPartOfDeclaration(index))
      .reduce((set, { token }) => set.add(token.valor), new Set<string>());
  }

  private isPartOfDeclaration(index: number): boolean {
    const prev = this.findPreviousSignificantToken(index);
    if (!prev) return false;

    if (this.isTypeDeclaration(prev)) return true;

    if (this.isPointerOperator(prev)) {
      const beforePointer = this.findPreviousSignificantToken(
        this.tokens.indexOf(prev)
      );
      return this.isTypeDeclaration(beforePointer);
    }

    return false;
  }

  private findPreviousSignificantToken(currentIndex: number): TokenRow | undefined {
    for (let i = currentIndex - 1; i >= 0; i--) {
      const token = this.tokens[i];
      
      if (this.isSignificantToken(token)) {
        return token;
      }
    }
    
    return undefined;
  }

  private isSignificantToken(token: TokenRow | undefined): boolean {
    if (!token) return false;
    return !['numero', 'string', 'caractere'].includes(token.tipo);
  }

  private findUndeclaredIdentifiers(used: Set<string>): Set<string> {
    const declared = new Set(this.symbols.keys());
    
    return new Set(
      Array.from(used).filter(
        id => !declared.has(id) && !CPP_KEYWORDS.has(id)
      )
    );
  }

  private reportRedeclaration(token: TokenRow): void {
    this.errorCollector.addSemantic({
      fase: 'semantico',
      tipo: SemanticErrorType.IDENTIFICADOR_REDECLARADO,
      mensagem: `Identificador "${token.valor}" já foi declarado`,
      linha: token.linha,
      coluna: token.coluna,
      trecho: token.valor,
      identificador: token.valor,
    });
  }

  private reportUndeclared(identifier: string): void {
    const token = this.tokens.find(
      t => t.tipo === 'identificador' && t.valor === identifier
    );
    
    if (token) {
      this.errorCollector.addSemantic({
        fase: 'semantico',
        tipo: SemanticErrorType.IDENTIFICADOR_NAO_DECLARADO,
        mensagem: `Identificador "${identifier}" não foi declarado`,
        linha: token.linha,
        coluna: token.coluna,
        trecho: identifier,
        identificador: identifier,
      });
    }
  }
}

export function analyzeSemantics(tokens: TokenRow[], errorCollector: ErrorCollector): void {
  new SemanticAnalyzer(tokens, errorCollector).analyze();
}

