// @target kotor1
// Example KOTOR 1 specific script

#include "k_inc_generic"

void main() {
    object oPC = GetFirstPC();
    
    // KOTOR 1 specific functionality
    int nStackSize = GetModuleItemAcquiredStackSize();
    object oItem = GetModuleItemAcquired();
    
    // Common KOTOR functionality
    SetGlobalNumber("K_CURRENT_PLANET", PLANET_TARIS);
    
    // This should generate an error if TSL-only functions are used
    // SetInfluence(oPC, 50); // This would be invalid for KOTOR 1
}
