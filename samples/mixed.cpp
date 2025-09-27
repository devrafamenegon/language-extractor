// Mixed sample combining features
#define INC(x) ((x)+1)
int main() {
  /* header */ int a = 10, b = 20; // init
  int arr[3] = {1, 2, 3};
  std::string text = "A: " + std::to_string(a) + ", B: " + std::to_string(b);
  // punctuators
  a = (arr[0] += 2) * (arr[1] - arr[2]);
  // shifts, members, scope
  a = (a << 1) >> 2; std::cout << text << std::endl; ::std::size_t n = text.size();
  // conditional
  int c = (a > b) ? a : b;
  // macro-like & comments
  int d = INC(c); /* trailing */
  return a + b + c + d + (int)n;
}


