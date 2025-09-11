// Example script without game version specification
// This should generate a warning about missing @target comment

#include "k_inc_generic"

void main() {
    object oPC = GetFirstPC();
    
    // Without version specification, both KOTOR 1 and 2 functions should be available
    SetGlobalNumber("K_CURRENT_PLANET", PLANET_TARIS);
    
    // Both of these should be available when no version is specified
    int nInfluence = GetInfluence(oPC); // KOTOR 2 function
    int nStackSize = GetModuleItemAcquiredStackSize(); // KOTOR 1 function
}
