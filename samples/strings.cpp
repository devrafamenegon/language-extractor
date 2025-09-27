int main() {
  const char* s1 = "hello\\nworld";
  const char* s2 = "quote: \" and backslash: \\";
  char c1 = '\''; // single quote char
  char c2 = '\\'; // backslash char
  const char* multi = "line1\n" "line2"; // adjacent strings
  return (int)(s1[0] + s2[0] + c1 + c2 + multi[0]);
}


