// @target kotor1
// Comprehensive NWScript test file for LSP validation
// This file tests various NWScript constructs and KOTOR-specific patterns

#include "k_inc_generic"
#include "k_inc_utility"

// Test constants
const int TEST_CONSTANT = 42;
const float PI_VALUE = 3.14159f;
const string GREETING = "Hello, KOTOR!";

// Test struct declaration
struct TestStruct {
    int nValue;
    float fValue;
    string sName;
    vector vPosition;
};

// Test global variables with KOTOR naming conventions
int g_nGlobalCounter = 0;
object g_oPlayer = OBJECT_INVALID;
vector g_vSpawnLocation = [0.0, 0.0, 0.0];

// Test function prototypes
void TestFunction(int nParam, float fParam = 1.0f);
int CalculateValue(int nBase, int nMultiplier);

// Main entry point
void main() {
    // Test variable declarations with Hungarian notation
    int nLocalValue = 10;
    float fDistance = 15.5f;
    string sPlayerName = "Revan";
    object oPC = GetFirstPC();
    vector vPosition = GetPosition(oPC);
    
    // Test function calls
    PrintString("Script started");
    
    // Test KOTOR-specific global variable usage
    SetGlobalNumber("K_CURRENT_PLANET", PLANET_TARIS);
    int nPlanet = GetGlobalNumber("K_CURRENT_PLANET");
    
    // Test object manipulation
    object oBastila = GetObjectByTag("bastila");
    if (GetIsObjectValid(oBastila)) {
        AddAvailableNPCByTemplate(NPC_BASTILA, "p_bastilla");
    }
    
    // Test mathematical operations
    int nSum = nLocalValue + nPlanet;
    float fProduct = fDistance * 2.0f;
    vector vOffset = vPosition + Vector(1.0, 2.0, 3.0);
    
    // Test conditional expressions
    int nResult = (nSum > 20) ? 1 : 0;
    
    // Test control flow
    if (GetIsPC(oPC)) {
        for (int i = 0; i < 10; i++) {
            nLocalValue += i;
        }
        
        while (nLocalValue > 0) {
            nLocalValue--;
            if (nLocalValue == 5) break;
        }
        
        switch (nPlanet) {
            case PLANET_TARIS:
                PrintString("On Taris");
                break;
            case PLANET_DANTOOINE:
                PrintString("On Dantooine");
                break;
            default:
                PrintString("Unknown planet");
                break;
        }
    }
    
    // Test vector operations
    vector vNewPos = vPosition + Vector(0.0, 0.0, 1.0);
    float fX = vNewPos.x;
    float fY = vNewPos.y;
    float fZ = vNewPos.z;
    
    // Test struct usage
    TestStruct stTest;
    stTest.nValue = 42;
    stTest.fValue = 3.14f;
    stTest.sName = "Test";
    stTest.vPosition = vPosition;
    
    // Test string operations
    string sCombined = sPlayerName + " is on " + IntToString(nPlanet);
    
    // Test increment/decrement
    nLocalValue++;
    ++fDistance;
    nSum--;
    --nResult;
    
    // Test assignment operators
    nLocalValue += 5;
    fDistance *= 2.0f;
    nSum -= 1;
    
    // Test bitwise operations
    int nFlags = DAMAGE_TYPE_BLASTER | DAMAGE_TYPE_ION;
    nFlags &= ~DAMAGE_TYPE_FIRE;
    
    // Test function with multiple parameters
    TestFunction(nLocalValue, fDistance);
    int nCalculated = CalculateValue(nSum, 3);
}

// Test function implementation
void TestFunction(int nParam, float fParam) {
    PrintString("TestFunction called with: " + IntToString(nParam) + ", " + FloatToString(fParam));
}

// Test function with return value
int CalculateValue(int nBase, int nMultiplier) {
    return nBase * nMultiplier;
}

// Test conditional entry point
int StartingConditional() {
    object oPC = GetFirstPC();
    int nLevel = GetHitDice(oPC);
    return (nLevel >= 5);
}

// Test error conditions (these should generate diagnostics)

// Uncomment these lines to test error detection:
/*
// Type mismatch error
void ErrorFunction1() {
    int nValue = "string value"; // Should error: type mismatch
}

// Unknown function error  
void ErrorFunction2() {
    NonExistentFunction(); // Should error: unknown function
}

// Missing return error
int ErrorFunction3() {
    int nValue = 10;
    // Should error: missing return statement
}

// Division by zero error
void ErrorFunction4() {
    int nResult = 10 / 0; // Should error: division by zero
}

// Invalid vector component
void ErrorFunction5() {
    vector vTest = [1.0, 2.0, 3.0];
    float fInvalid = vTest.w; // Should error: invalid vector component
}
*/
