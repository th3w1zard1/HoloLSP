// Test script for variable value inference
// Try hovering over variables to see their inferred values

void main() {
    // Basic declarations and assignments
    int a = 10;
    int b = 5;
    int c;
    
    // Simple arithmetic
    c = a + b;  // c should show as 15
    a = a + 1;  // a should show as 11
    
    // Compound assignments
    b += 3;     // b should show as 8
    c *= 2;     // c should show as 30
    
    // Increment/decrement
    a++;        // a should show as 12
    ++b;        // b should show as 9
    c--;        // c should show as 29
    
    // More complex expressions
    int result = (a * b) + c;  // result should show as 137 (12 * 9 + 29)
    float f = result / 10.0;   // f should show as 13.7
    
    // Test with variables in expressions
    int x = a + b;             // x should show as 21 (12 + 9)
    int y = x * 2;             // y should show as 42 (21 * 2)
    
    // Print the final values
    PrintString("a = " + IntToString(a));
    PrintString("b = " + IntToString(b));
    PrintString("c = " + IntToString(c));
    PrintString("result = " + IntToString(result));
    PrintString("f = " + FloatToString(f));
    PrintString("x = " + IntToString(x));
    PrintString("y = " + IntToString(y));
}
