// Arquivo de exemplo com erros propositais para teste

int main() {
  // Erro léxico: string não fechada
  char* msg = "Hello World;
  
  // Erro sintático: parêntese não fechado
  int resultado = soma(10, 20;
  
  // Erro semântico: variável não declarada
  int y = x + 5;
  
  // Erro semântico: redeclaração
  int y = 10;
  
  return 0;
}

