int main() {
  int a = 1, b = 2;
  int x = a + b - 3 * 4 / 2 % 5;
  bool eq = (a == b) || (a != b) && (a < b) && (a <= b) && (a > b) && (a >= b);
  int y = a++ + --b;
  int z = (a << 2) + (b >> 1);
  a &= 1; b |= 2; a ^= 3; a <<= 1; b >>= 2; a += 5; b -= 6; a *= 7; b /= 8; a %= 9;
  bool logic = !false && true || false;
  int m = (a ? b : z);
  std::vector<int> v; v.push_back(10);
  int w = v.at(0);
  return x + y + z + w + (int)eq + (int)logic + m;
}


