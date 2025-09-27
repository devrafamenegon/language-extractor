int main() {
  int a = 1 + \
          2 + \
          3;
  const char* s = "split\\\
line"; // backslash + newline inside string (escaped)
  return a + (int)s[0];
}


