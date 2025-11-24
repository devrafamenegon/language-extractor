/**
 * Tipos de erros específicos de C++.
 */

export enum LexicalErrorType {
  CARACTERE_INVALIDO = 'caractere_invalido',
  STRING_NAO_FECHADA = 'string_nao_fechada',
  CARACTERE_NAO_FECHADO = 'caractere_nao_fechado',
  COMENTARIO_NAO_FECHADO = 'comentario_nao_fechado',
  NUMERO_INVALIDO = 'numero_invalido'
}

export enum SyntacticErrorType {
  TOKEN_INESPERADO = 'token_inesperado',
  TOKEN_FALTANDO = 'token_faltando',
  EXPRESSAO_INCOMPLETA = 'expressao_incompleta',
  DECLARACAO_INCOMPLETA = 'declaracao_incompleta',
  PARENTESE_NAO_FECHADO = 'parentese_nao_fechado',
  CHAVE_NAO_FECHADA = 'chave_nao_fechada',
  COLCHETE_NAO_FECHADO = 'colchete_nao_fechado'
}

export enum SemanticErrorType {
  IDENTIFICADOR_NAO_DECLARADO = 'identificador_nao_declarado',
  IDENTIFICADOR_REDECLARADO = 'identificador_redeclarado',
  TIPO_INCOMPATIVEL = 'tipo_incompativel',
  FUNCAO_NAO_DECLARADA = 'funcao_nao_declarada',
  PARAMETROS_INCOMPATIVEIS = 'parametros_incompativeis',
  USO_INVALIDO_TIPO = 'uso_invalido_tipo'
}

