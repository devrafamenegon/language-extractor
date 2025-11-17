/**
 * Analisador semântico básico para C/C++.
 * Verifica regras semânticas como identificadores não declarados, redeclarações, etc.
 */
import { TokenRow } from '../tokens/codes';
import { ErrorCollector, SemanticError } from '../../../errors';
import { SemanticErrorType } from '../errors/ErrorTypes';

interface Symbol {
  nome: string;
  tipo: 'variavel' | 'funcao' | 'tipo';
  linha: number;
  coluna: number;
}

export class SemanticAnalyzer {
  private tokens: TokenRow[];
  private errorCollector: ErrorCollector;
  private symbols: Map<string, Symbol> = new Map();
  private currentScope: Symbol[] = [];

  constructor(tokens: TokenRow[], errorCollector: ErrorCollector) {
    this.tokens = tokens;
    this.errorCollector = errorCollector;
  }

  /**
   * Realiza a análise semântica.
   */
  analyze(): void {
    let i = 0;
    while (i < this.tokens.length) {
      const token = this.tokens[i];
      
      // Detecta declaração de tipo seguida de identificador
      if (token?.tipo === 'palavra_reservada' && this.isTypeKeyword(token.valor)) {
        i = this.processDeclaration(i);
      } else if (token?.tipo === 'identificador') {
        // Uso de identificador
        this.checkIdentifierUsage(token!);
      }
      
      i++;
    }
    
    // Verifica identificadores usados mas não declarados
    this.checkUndeclaredIdentifiers();
  }

  /**
   * Processa uma declaração de variável ou função.
   */
  private processDeclaration(startIndex: number): number {
    const typeToken = this.tokens[startIndex];
    if (!typeToken || typeToken.tipo !== 'palavra_reservada') return startIndex + 1;
    
    // Procura o identificador após o tipo
    let i = startIndex + 1;
    while (i < this.tokens.length && this.tokens[i]?.tipo === 'operador' && this.tokens[i]?.valor === '*') {
      i++; // Ponteiros
    }
    
    const idToken = this.tokens[i];
    if (!idToken || idToken.tipo !== 'identificador') return i;
    
    const identifierName = idToken.valor;
    
    // Verifica se já foi declarado no mesmo escopo
    const existingSymbol = this.symbols.get(identifierName);
    if (existingSymbol) {
      // Verifica se é no mesmo escopo (linha próxima)
      const isRedeclaration = Math.abs(existingSymbol.linha - idToken.linha) < 10;
      if (isRedeclaration) {
        this.errorCollector.addSemantic({
          fase: 'semantico',
          tipo: SemanticErrorType.IDENTIFICADOR_REDECLARADO,
          mensagem: `Identificador "${identifierName}" já foi declarado`,
          linha: idToken.linha,
          coluna: idToken.coluna,
          trecho: identifierName,
          identificador: identifierName,
        });
      }
    }
    
    // Determina se é função ou variável
    let isFunction = false;
    let j = i + 1;
    while (j < this.tokens.length) {
      const next = this.tokens[j];
      if (next?.tipo === 'delimitador' && next?.valor === '(') {
        isFunction = true;
        break;
      }
      if (next?.tipo === 'delimitador' && next?.valor === ';') {
        break;
      }
      if (next?.tipo === 'delimitador' && next?.valor === '{') {
        isFunction = true;
        break;
      }
      j++;
    }
    
    // Registra o símbolo
    this.symbols.set(identifierName, {
      nome: identifierName,
      tipo: isFunction ? 'funcao' : 'variavel',
      linha: idToken.linha,
      coluna: idToken.coluna,
    });
    
    return j;
  }

  /**
   * Verifica o uso de um identificador.
   */
  private checkIdentifierUsage(token: TokenRow): void {
    // Ignora se for parte de uma declaração (verificado separadamente)
    const prevToken = this.getPreviousNonWhitespaceToken(token);
    
    // Se o token anterior é um tipo reservado, provavelmente é uma declaração
    if (prevToken?.tipo === 'palavra_reservada' && this.isTypeKeyword(prevToken.valor)) {
      return;
    }
    
    // Se o token anterior é um delimitador de tipo como '*', também pode ser declaração
    if (prevToken && prevToken.tipo === 'operador' && prevToken.valor === '*') {
      const beforePtr = this.getPreviousNonWhitespaceToken(prevToken);
      if (beforePtr && beforePtr.tipo === 'palavra_reservada' && this.isTypeKeyword(beforePtr.valor)) {
        return;
      }
    }
    
    // Verifica se o identificador foi declarado
    const symbol = this.symbols.get(token.valor);
    if (!symbol) {
      // Verifica se não é uma palavra-chave (ignore palavras-chave mal categorizadas)
      const cppKeywords = [
        'if', 'else', 'while', 'for', 'return', 'break', 'continue',
        'int', 'char', 'float', 'double', 'void', 'bool',
        'const', 'static', 'extern', 'auto',
      ];
      
      if (!cppKeywords.includes(token.valor)) {
        // Não é uma palavra-chave conhecida, então é um identificador não declarado
        // Mas não vamos reportar ainda - vamos apenas marcar para verificação posterior
      }
    }
  }

  /**
   * Verifica identificadores usados mas não declarados.
   */
  private checkUndeclaredIdentifiers(): void {
    const usedIdentifiers = new Set<string>();
    const declaredIdentifiers = new Set(this.symbols.keys());
    
    // Coleta todos os identificadores usados
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      
      if (token?.tipo === 'identificador') {
        // Verifica se não é parte de uma declaração
        const prevToken = this.getPreviousNonWhitespaceTokenIndex(i);
        const prev = prevToken >= 0 ? this.tokens[prevToken] : null;
        
        // Se o anterior é um tipo reservado ou '*', provavelmente é declaração
        const isDeclaration = prev && (
          (prev.tipo === 'palavra_reservada' && this.isTypeKeyword(prev.valor)) ||
          (prev.tipo === 'operador' && prev.valor === '*')
        );
        
        if (!isDeclaration) {
          usedIdentifiers.add(token.valor);
        }
      }
    }
    
    // Palavras-chave conhecidas que não devem ser reportadas como não declaradas
    const cppKeywords = new Set([
      'if', 'else', 'while', 'for', 'return', 'break', 'continue',
      'int', 'char', 'float', 'double', 'void', 'bool',
      'const', 'static', 'extern', 'auto', 'struct', 'class',
      'namespace', 'using', 'include', 'define',
    ]);
    
    // Verifica identificadores não declarados
    for (const identifier of usedIdentifiers) {
      if (!declaredIdentifiers.has(identifier) && !cppKeywords.has(identifier)) {
        // Encontra a primeira ocorrência do identificador
        const firstToken = this.tokens.find(t => t.tipo === 'identificador' && t.valor === identifier);
        if (firstToken) {
          this.errorCollector.addSemantic({
            fase: 'semantico',
            tipo: SemanticErrorType.IDENTIFICADOR_NAO_DECLARADO,
            mensagem: `Identificador "${identifier}" não foi declarado`,
            linha: firstToken.linha,
            coluna: firstToken.coluna,
            trecho: identifier,
            identificador: identifier,
          });
        }
      }
    }
  }

  /**
   * Verifica se uma palavra é um tipo reservado.
   */
  private isTypeKeyword(word: string): boolean {
    const types = ['int', 'char', 'float', 'double', 'void', 'bool', 'short', 'long', 'unsigned', 'signed'];
    return types.includes(word);
  }

  /**
   * Retorna o token anterior não-whitespace.
   */
  private getPreviousNonWhitespaceToken(current: TokenRow): TokenRow | null {
    const index = this.tokens.indexOf(current);
    return this.getPreviousNonWhitespaceTokenIndex(index) >= 0
      ? this.tokens[this.getPreviousNonWhitespaceTokenIndex(index)]!
      : null;
  }

  /**
   * Retorna o índice do token anterior não-whitespace.
   */
  private getPreviousNonWhitespaceTokenIndex(currentIndex: number): number {
    for (let i = currentIndex - 1; i >= 0; i--) {
      const token = this.tokens[i];
      // Ignora delimitadores que não são significativos para declaração
      if (token?.tipo !== 'numero' && token?.tipo !== 'string' && token?.tipo !== 'caractere') {
        // Não é whitespace (já que não há tokens de whitespace na lista)
        return i;
      }
    }
    return -1;
  }
}

/**
 * Realiza análise semântica sobre uma lista de tokens.
 */
export function analyzeSemantics(tokens: TokenRow[], errorCollector: ErrorCollector): void {
  const analyzer = new SemanticAnalyzer(tokens, errorCollector);
  analyzer.analyze();
}


