// @target kotor2
// Example KOTOR 2/TSL specific script

#include "k_inc_generic"

void main() {
    object oPC = GetFirstPC();
    
    // KOTOR 2/TSL specific functionality
    int nInfluence = GetInfluence(oPC);
    SetInfluence(oPC, 75);
    
    int nUpgradeType = GetWorkbenchUpgradeType();
    
    // Common KOTOR functionality
    SetGlobalNumber("K_CURRENT_PLANET", PLANET_PERAGUS);
    
    // This should generate an error if KOTOR 1-only functions are used
    // int nStackSize = GetModuleItemAcquiredStackSize(); // This would be invalid for KOTOR 2
}
