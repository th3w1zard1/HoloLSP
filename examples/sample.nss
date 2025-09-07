// Sample KOTOR NWScript file demonstrating HoloLSP features
// This script shows various NWScript constructs and KOTOR-specific elements

#include "k_inc_utility"

// Function to demonstrate KOTOR scripting
void main()
{
    object oPC = GetFirstPC();
    object oSelf = OBJECT_SELF;
    
    // Check if we have a valid PC
    if (GetIsPC(oPC))
    {
        string sName = GetName(oPC);
        PrintString("Player character name: " + sName);
        
        // Get player stats
        int nLevel = GetHitDice(oPC);
        int nStrength = GetAbilityScore(oPC, ABILITY_STRENGTH);
        int nDexterity = GetAbilityScore(oPC, ABILITY_DEXTERITY);
        
        PrintString("Level: " + IntToString(nLevel));
        PrintString("Strength: " + IntToString(nStrength));
        PrintString("Dexterity: " + IntToString(nDexterity));
        
        // Set some global variables
        SetGlobalNumber("PLAYER_LEVEL", nLevel);
        SetGlobalString("PLAYER_NAME", sName);
        
        // Check current planet
        int nPlanet = GetGlobalNumber("K_CURRENT_PLANET");
        
        switch (nPlanet)
        {
            case 5:  // Endar Spire equivalent
                PrintString("Currently on the Endar Spire");
                break;
            case 10: // Taris equivalent  
                PrintString("Currently on Taris");
                break;
            case 15: // Dantooine equivalent
                PrintString("Currently on Dantooine");
                break;
            default:
                PrintString("Unknown location");
                break;
        }
        
        // Create a location and move there
        vector vPosition = Vector(0.0, 0.0, 0.0);
        location lDestination = Location(GetArea(oPC), vPosition, 0.0);
        
        // Queue some actions
        AssignCommand(oPC, ActionMoveToLocation(lDestination));
        AssignCommand(oPC, ActionPlayAnimation(ANIMATION_FIREFORGET_GREETING));
    }
    
    // Demonstrate damage types
    int nDamageType = DAMAGE_TYPE_BLASTER | DAMAGE_TYPE_ION;
    
    // Example of applying damage
    effect eDamage = EffectDamage(10, nDamageType);
    ApplyEffectToObject(DURATION_TYPE_INSTANT, eDamage, oSelf);
}

// Helper function demonstrating parameter usage
void MoveToTarget(object oMover, object oTarget, int bRun = FALSE)
{
    if (GetIsObjectValid(oMover) && GetIsObjectValid(oTarget))
    {
        float fDistance = GetDistanceBetween(oMover, oTarget);
        
        if (fDistance > 2.0)
        {
            AssignCommand(oMover, ActionMoveToObject(oTarget, bRun));
        }
    }
}

// Function demonstrating KOTOR-specific constants
void DemonstratePlanets()
{
    // Set different planetary globals
    SetGlobalNumber("K_CURRENT_PLANET", PLANET_TARIS);
    SetGlobalNumber("K_CURRENT_PLANET", PLANET_DANTOOINE);  
    SetGlobalNumber("K_CURRENT_PLANET", PLANET_KASHYYYK);
    SetGlobalNumber("K_CURRENT_PLANET", PLANET_MANAAN);
    SetGlobalNumber("K_CURRENT_PLANET", PLANET_KORRIBAN);
    SetGlobalNumber("K_CURRENT_PLANET", PLANET_TATOOINE);
}
