int main() {
  // line comment with operators: a += b; should be ignored
  int a = 0; /* block comment with tokens: if (x) { y++; } */
  /* nested-like * comment start */ a = a + 1; /* end */
  // URL-like sequence shouldn't break: http://example.com
  return a; // end
}


