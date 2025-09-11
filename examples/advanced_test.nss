// Advanced test script for variable value inference
// Try hovering over variables to see their inferred values

// Function to calculate factorial
int factorial(int n) {
    // Base case
    if (n <= 1) {
        return 1;
    }
    
    // Recursive case
    return n * factorial(n - 1);
}

// Function to calculate fibonacci
int fibonacci(int n) {
    if (n <= 0) {
        return 0;
    }
    else if (n == 1) {
        return 1;
    }
    else {
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}

// Test conditional values
void main() {
    // Basic variable declarations
    int a = 10;
    int b = 5;
    
    // Conditional values
    if (a > b) {
        a = 20;
    } else {
        a = 30;
    }
    // Hover over 'a' here - should show conditional values
    
    // Ternary operator
    int c = (b > 3) ? 100 : 200;
    // Hover over 'c' here - should show value 100
    
    // Loop with counter
    int sum = 0;
    for (int i = 1; i <= 5; i++) {
        sum += i;
    }
    // Hover over 'sum' here - should show value is modified in a loop
    
    // Function calls
    int fact5 = factorial(5);
    // Hover over 'fact5' - should show it's calling a function
    
    // Complex expressions
    int result = (a + b) * (c - b) / 2;
    // Hover over 'result' - should show computed value or conditional values
    
    // Logical operators
    int logicalTest = (a > b && c > 50) ? 1 : 0;
    // Hover over 'logicalTest' - should show value 1
    
    // Nested conditions
    int nestedValue;
    if (a > 15) {
        if (b < 10) {
            nestedValue = 42;
        } else {
            nestedValue = 24;
        }
    } else {
        nestedValue = 0;
    }
    // Hover over 'nestedValue' - should show conditional values
    
    // Print results
    PrintString("a = " + IntToString(a));
    PrintString("b = " + IntToString(b));
    PrintString("c = " + IntToString(c));
    PrintString("sum = " + IntToString(sum));
    PrintString("fact5 = " + IntToString(fact5));
    PrintString("result = " + IntToString(result));
    PrintString("logicalTest = " + IntToString(logicalTest));
    PrintString("nestedValue = " + IntToString(nestedValue));
}
