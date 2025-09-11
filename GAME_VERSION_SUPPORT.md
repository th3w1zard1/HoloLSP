# Game Version Support in HoloLSP

HoloLSP supports targeting specific KOTOR game versions to provide accurate validation and completions based on the available functions and constants in each game.

## Specifying Target Game Version

Add one of the following comments at the top of your NWScript file (within the first 10 lines):

### TypeScript/C++ Style

```nwscript
// @target kotor1
// @target kotor2
// @game kotor1  
// @game kotor2
// @version k1
// @version k2
```

### Pragma Style

```nwscript
// #pragma target kotor1
// #pragma target kotor2
// #pragma game k1
// #pragma game k2
```

### JSDoc Style

```nwscript
/** @target kotor1 */
/** @target kotor2 */
```

### Simple Comments

```nwscript
// kotor1 only
// kotor2 only
// for kotor1
// for kotor2
// target: k1
// target: k2
```

## Supported Version Identifiers

- `kotor1`, `k1` - Knights of the Old Republic (2003)
- `kotor2`, `tsl`, `k2` - Knights of the Old Republic II: The Sith Lords (2004)

## Behavior

### With Version Specified

When a target version is specified, the LSP will:

- Only show functions and constants available in that game version
- Generate errors for functions/constants from the other game
- Provide game-specific validation rules
- Show appropriate completions and hover information

### Without Version Specified

When no target version is specified:

- A warning is displayed suggesting to add a version comment
- Quick fixes are available to add the appropriate comment
- Both KOTOR 1 and KOTOR 2 functions/constants are available
- No game-specific validation errors are generated

## Examples

### KOTOR 1 Script

```nwscript
// @target kotor1

void main() {
    // KOTOR 1 specific functions are available
    int nStackSize = GetModuleItemAcquiredStackSize();
    
    // KOTOR 2 functions will generate errors
    // SetInfluence(oPC, 50); // ERROR: Only available in KOTOR 2
}
```

### KOTOR 2/TSL Script

```nwscript
// @target kotor2

void main() {
    object oPC = GetFirstPC();
    
    // KOTOR 2 specific functions are available
    SetInfluence(oPC, 75);
    int nUpgrade = GetWorkbenchUpgradeType();
    
    // KOTOR 1 functions will generate warnings
    // GetModuleItemAcquiredStackSize(); // WARNING: May not be available in KOTOR 2
}
```

### No Version Specified

```nwscript
// WARNING: No target game version specified

void main() {
    // Both KOTOR 1 and KOTOR 2 functions are available
    // No validation errors for game-specific functions
    SetInfluence(GetFirstPC(), 50); // OK
    GetModuleItemAcquiredStackSize(); // OK
}
```

## Quick Fixes

When the LSP detects a missing game version comment, it provides quick fixes through VS Code:

1. "Add KOTOR 1 target comment" - Adds `// @target kotor1`
2. "Add KOTOR 2/TSL target comment" - Adds `// @target kotor2`

These can be accessed through VS Code's "Quick Fix" action (Ctrl+. or Cmd+. on the warning).

## Integration with Existing Features

The game version detection integrates with all existing LSP features:

- **Syntax validation** - Game-specific function availability
- **Type checking** - Version-appropriate function signatures  
- **Code completion** - Only shows available functions/constants
- **Hover information** - Displays game-specific documentation
- **Error reporting** - Context-aware error messages
- **KOTOR validator** - Version-specific pattern validation

This ensures that scripts are validated against the correct game's API, preventing runtime errors and improving the development experience.
