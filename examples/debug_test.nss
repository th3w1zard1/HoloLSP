#include "k_inc_debug"

void main() {
    int x = 10;
    float y = 20.5;
    string s = "Hello, NWScript!";
    object o = GetFirstObjectInArea(OBJECT_SELF);
    
    PrintString("Starting debug_test.nss");
    
    x = x + 5; // Breakpoint here
    y = y * 2.0;
    
    if (x > 10) {
        s = s + " World!";
        PrintString(s);
    }
    
    int i;
    for (i = 0; i < 3; i++) {
        PrintString("Loop iteration: " + IntToString(i));
    }
    
    TestFunction(x, y); // Step into this
    PrintString("Finished debug_test.nss");
}

void TestFunction(int a, float b) {
    int result = a + FloatToInt(b);
    PrintString("Inside TestFunction. Result: " + IntToString(result));
}