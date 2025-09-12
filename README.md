# HoloLSP - KOTOR NWScript Language Server

A comprehensive Language Server Protocol extension for VS Code that provides IntelliSense, syntax highlighting, code completion, and debugging support for NWScript - the scripting language used in Star Wars: Knights of the Old Republic (KOTOR) and KOTOR II: The Sith Lords (TSL).

## Features

### 🎯 **Language Support**

- **Syntax Highlighting** - Full NWScript syntax highlighting with KOTOR-specific patterns
- **IntelliSense** - Auto-completion for functions, constants, variables, and keywords
- **Error Detection** - Real-time syntax validation and semantic analysis
- **Hover Information** - Detailed documentation on hover for functions and constants
- **Go to Definition** - Navigate to function and variable declarations
- **Document Symbols** - Outline view of functions, variables, and structures
- **Signature Help** - Parameter hints for function calls

### 🎮 **KOTOR-Specific Features**

- **Game Version Detection** - Automatically detects target game version (KOTOR 1 vs KOTOR 2)
- **Version-Specific Validation** - Shows only functions/constants available in the target game
- **KOTOR Function Library** - Complete database of KOTOR 1 and KOTOR 2 functions and constants
- **Include File Support** - Resolves `#include` directives with bundled KOTOR script libraries
- **Hungarian Notation** - Supports KOTOR's variable naming conventions (nValue, fDistance, etc.)

### 🐛 **Debugging Support**

- **NWScript Debugger** - Debug NWScript files directly in VS Code
- **Breakpoints** - Set breakpoints and step through code execution
- **Variable Inspection** - Examine variable values during debugging
- **Call Stack** - View the execution call stack

### 🔧 **Advanced Features**

- **Semantic Analysis** - Deep code analysis with type checking
- **Variable Value Inference** - Hover to see inferred variable values
- **Expression Evaluation** - Evaluate complex expressions at compile-time
- **Include Dependency Tracking** - Tracks include file dependencies and circular references
- **Quick Fixes** - Automated fixes for common issues (e.g., missing game version)

## Installation

### From VS Code Marketplace (unfinished)

1. ~~Open VS Code~~
2. ~~Go to Extensions (Ctrl+Shift+X)~~
3. ~~Search for "HoloLSP"~~
4. ~~Click Install~~

### Manual Installation

1. Download the `.vsix` file from the [Releases](https://github.com/th3w1zard1/HoloLSP/releases) page
2. Open VS Code
3. Run `Extensions: Install from VSIX...` from the Command Palette (Ctrl+Shift+P)
4. Select the downloaded `.vsix` file

## Usage

### Setting Up Your Project

1. **Create a new NWScript file** with the `.nss` extension
2. **Specify the target game version** at the top of your file:

   ```nwscript
   // @target kotor1
   // or
   // @target kotor2
   ```

### Game Version Support

HoloLSP supports targeting specific KOTOR game versions for accurate validation. Add one of these comments within the first 10 lines of your script:

#### Supported Version Comments

```nwscript
// @target kotor1        // KOTOR 1
// @target kotor2        // KOTOR 2/TSL
// @game kotor1          // Alternative syntax
// @version k1           // Short form
// #pragma target kotor1 // Pragma style
/** @target kotor1 */    // JSDoc style
// kotor1 only          // Simple comment
```

#### Version Identifiers

- `kotor1`, `k1` - Knights of the Old Republic (2003)
- `kotor2`, `tsl`, `k2` - Knights of the Old Republic II: The Sith Lords (2004)

### Example Script

```nwscript
// @target kotor1
// Example KOTOR 1 script with full language support

#include "k_inc_generic"

void main() {
    object oPC = GetFirstPC();
    
    // KOTOR-specific functionality
    int nStackSize = GetModuleItemAcquiredStackSize();
    object oItem = GetModuleItemAcquired();
    
    // Global variable management
    SetGlobalNumber("K_CURRENT_PLANET", PLANET_TARIS);
    int nPlanet = GetGlobalNumber("K_CURRENT_PLANET");
    
    // Vector operations
    vector vPosition = GetPosition(oPC);
    vector vNewPos = vPosition + Vector(0.0, 0.0, 1.0);
    
    // Control flow with KOTOR constants
    if (GetIsPC(oPC)) {
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
}
```

## Configuration

### Extension Settings

Configure HoloLSP through VS Code settings:

```json
{
  "holoLSP.maxNumberOfProblems": 100,
  "holoLSP.builtinScriptsDirectory": "/path/to/kotor/scripts"
}
```

#### Available Settings

- `holoLSP.maxNumberOfProblems` (number, default: 100)  
  Controls the maximum number of problems produced by the server. Configure this if it does not run well on your system.

- `holoLSP.builtinScriptsDirectory` (string, optional)  
  Directory path for builtin KOTOR scripts. When set, "Go to Definition" for included scripts will resolve to files in this directory instead of using the virtual `hololsp://` scheme. Supports absolute paths, relative paths (relative to the current file), or `file://` URIs. This setting is particularly useful for non-VS Code LSP clients like Emacs that cannot handle custom URI schemes.

## Supported File Types

- `.nss` - NWScript source files
- `.ncs` - Compiled NWScript files (read-only support, mostly WIP)

## KOTOR Function Library

HoloLSP includes comprehensive function and constant definitions for both KOTOR games:

- **5000+ Functions** - Complete KOTOR 1 and KOTOR 2 function libraries (from e.g. nwscript.nss)
- **2000+ Constants** - All game constants, categorized for organizational usage.
- **Include Files** - Bundled KOTOR script library includes (`k_inc_generic`, `k_inc_utility`, etc.)
- **Type Definitions** - Complete type system with proper validation

## Advanced Features

### Variable Value Inference

HoloLSP can infer and display variable values:

```nwscript
int a = 10;
int b = 5;
int c = (a > b) ? 100 : 200; // Hover shows: c = 100
```

### Include File Resolution

Automatically resolves include files from the bundled KOTOR libraries:

```nwscript
#include "k_inc_generic"  // Resolves to bundled library
#include "some_local_script" // Looks for local file (should be adjacent to the script in question--modules aren't supported yet
```

### Expression Evaluation

Evaluates complex expressions in real time:

```nwscript
const int RESULT = 2 + 3 * 4; // Shows: RESULT = 14
vector vPos = [1.0, 2.0, 3.0] + Vector(1.0, 0.0, 0.0); // Shows computed result
```

#### Example Configuration for Non-VS Code Editors

For editors like Emacs that work with the LSP but don't handle custom URI schemes:

```json
{
  "holoLSP.builtinScriptsDirectory": "/tmp/nss",
  "holoLSP.maxNumberOfProblems": 1000
}
```

This will make "Go to Definition" return `file:///tmp/nss/k_inc_generic.nss` instead of `hololsp:/kotor/k_inc_generic.nss`.

#### Recent Improvements

- **Fixed "Go to Definition"**: Now supports configurable URI schemes for better compatibility with non-VS Code editors
- **Improved "Find All References"**: Now excludes commented-out code from reference results

## Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Add tests for new features (preferably using Jest)
- Update documentation for user-facing changes
- Fork the repo, submit a PR.

## Known Issues

- Large include files may cause performance issues during initial parsing (e.g., `nwscript.nss`, or large include chains)
- Some complex macro expansions are not fully supported
- Most of the assumptions about the syntax were heavily based on C/C++, others taken from projects like GitHub's own markdown template for nwn:ee. Please report any incorrect syntax that isn't valid in the games.

## Roadmap

- [ ] **Enhanced Debugging** - More advanced debugging features
- [ ] **Script Compilation** - Built-in NWScript compiler
- [ ] **Module Integration** - Direct integration with KOTOR module files (ERF/RIM/MOD) potentially even BIK.
- [ ] **Template Support** - Script templates and snippets for common KOTOR patterns
- [ ] **Performance Optimization** - Faster parsing for large projects

### Debugging

Most of this section is untested.

1. **Set breakpoints** by clicking in the gutter next to line numbers
2. **Start debugging** using F5 or the "Debug NWScript" command
3. **Step through code** using the debugging controls
4. **Inspect variables** in the Variables panel

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- VS Code (v1.75.0 or higher)

### Building from Source

1. **Clone the repository:**

   ```bash
   git clone https://github.com/th3w1zard1/HoloLSP.git
   cd HoloLSP
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Compile the project:**

   ```bash
   npm run compile
   ```

4. **Watch for changes during development:**

   ```bash
   npm run watch
   ```

### Project Structure

```bash
HoloLSP/
├── client/                 # VS Code extension client
│   ├── src/
│   │   ├── extension.ts    # Main extension entry point
│   │   ├── debugAdapter.ts # Debug adapter implementation
│   │   └── testing.ts      # Test framework integration
│   └── package.json
├── server/                 # Language server implementation
│   ├── src/
│   │   ├── server.ts       # Main language server
│   │   ├── nwscript-parser.ts     # NWScript parser
│   │   ├── nwscript-lexer.ts      # NWScript lexer
│   │   ├── completion-provider.ts  # Code completion
│   │   ├── diagnostic-provider.ts  # Error diagnostics
│   │   ├── kotor-definitions.ts    # KOTOR function/constant definitions
│   │   ├── game-version-detector.ts # Game version detection
│   │   └── semantic-analyzer.ts    # Semantic analysis
│   └── package.json
├── mcp/                    # Model Context Protocol integration
├── syntaxes/              # TextMate grammar for syntax highlighting
├── examples/              # Example NWScript files
├── vendor/                # Third-party dependencies (PyKotor)
└── package.json           # Main package configuration
```

### Running Tests

```bash
# Run server tests
npm run build:tests
cd server && npm test

# Run with watch mode
cd server && npm run test:watch
```

### Debugging the Extension

1. **Open the project in VS Code**
2. **Press F5** to launch a new Extension Development Host
3. **Use "Client + Server" configuration** to debug both client and server simultaneously

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **PyKotor Team** - For the comprehensive KOTOR script definitions and tools
- **KOTOR Modding Community** - For extensive testing and feedback
- **BioWare** - For creating the amazing KOTOR games and NWScript language

## Support

- **GitHub Issues** - [Report bugs and request features](https://github.com/th3w1zard1/HoloLSP/issues)
- **Discussions** - [Community support and questions](https://github.com/th3w1zard1/HoloLSP/discussions)

---

**May the Force be with your scripts!** ⚡
