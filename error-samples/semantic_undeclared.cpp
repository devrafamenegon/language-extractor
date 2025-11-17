/**
 * Exemplo de erro semântico: identificador não declarado
 */
int main() {
    int x = 10;
    int y = z + 5;  // 'z' não foi declarado
    return 0;
}

