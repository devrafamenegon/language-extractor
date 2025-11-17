/**
 * Exemplo com erros semânticos complexos
 */
int main() {
    int x = 10;
    int y = 20;
    
    // Uso de variável não declarada
    int result = x + y + z;
    
    // Redeclaração
    int x = 30;
    
    // Função não declarada
    int value = calculate(x, y);
    
    return 0;
}

