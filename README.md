# HoloLSP - KOTOR NWScript Language Server

HoloLSP is a Language Server Protocol (LSP) extension for Visual Studio Code that provides comprehensive support for NWScript, the scripting language used in Star Wars: Knights of the Old Republic (KOTOR) and Knights of the Old Republic II: The Sith Lords (TSL).

This extension leverages the [PyKotor](https://github.com/NickHugi/PyKotor) library to provide accurate language support specifically tailored for KOTOR's variant of NWScript, which includes additional constants, functions, and features not found in the original Neverwinter Nights implementation.

## Features

- **Syntax Highlighting**: Full syntax highlighting for NWScript files (.nss)
- **IntelliSense**: Auto-completion for:
  - KOTOR-specific constants (damage types, abilities, planets, etc.)
  - Built-in functions with parameter information
  - Data types (int, float, string, object, vector, location, etc.)
  - Keywords and control structures
- **Error Detection**: Basic syntax validation and undefined function warnings
- **Hover Information**: Detailed information about functions and constants
- **Signature Help**: Parameter hints for function calls
- **File Association**: Automatic recognition of .nss and .ncs files

## Installation

### From Source

1. Clone this repository:

   ```bash
   git clone https://github.com/NickHugi/HoloLSP.git
   cd HoloLSP
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Compile the extension:

   ```bash
   npm run compile
   ```

4. Open the project in VS Code and press F5 to launch the extension in a new Extension Development Host window.

### Package as VSIX

To create a distributable .vsix file:

1. Install the VS Code Extension Manager:

   ```bash
   npm install -g vsce
   ```

2. Package the extension:

   ```bash
   vsce package
   ```

3. Install the generated .vsix file in VS Code:
   - Open VS Code
   - Go to Extensions view (Ctrl+Shift+X)
   - Click the "..." menu and select "Install from VSIX..."
   - Select the generated .vsix file

## Usage

1. Open a .nss file or create a new file with the .nss extension
2. The extension will automatically activate and provide language support
3. Start typing to see auto-completion suggestions
4. Hover over functions and constants to see documentation
5. Use Ctrl+Space to trigger IntelliSense manually

## KOTOR-Specific Features

This extension includes support for KOTOR-specific scripting elements:

### Constants

- **Damage Types**: `DAMAGE_TYPE_BLASTER`, `DAMAGE_TYPE_ION`, `DAMAGE_TYPE_SONIC`, etc.
- **Abilities**: `ABILITY_STRENGTH`, `ABILITY_DEXTERITY`, `ABILITY_CONSTITUTION`, etc.
- **Planets**: `PLANET_TARIS`, `PLANET_DANTOOINE`, `PLANET_KASHYYYK`, etc.
- **Objects**: `OBJECT_SELF`, `OBJECT_INVALID`
- **Boolean Values**: `TRUE`, `FALSE`

### Functions

- **Object Manipulation**: `GetObjectByTag`, `GetName`, `GetIsPC`
- **Actions**: `ActionMoveToObject`, `ActionStartConversation`
- **Character Stats**: `GetHitDice`, `GetAbilityScore`
- **Global Variables**: `GetGlobalNumber`, `SetGlobalNumber`, `GetGlobalString`, `SetGlobalString`
- **Utilities**: `PrintString`, `Vector`, `Location`

### Data Types

- `void` - No return value
- `int` - 32-bit signed integer
- `float` - 32-bit floating point number
- `string` - Text string
- `object` - Game object reference
- `vector` - 3D vector with x, y, z components
- `location` - Position and orientation in an area
- `event` - Game event
- `effect` - Game effect
- `itemproperty` - Item property
- `talent` - Character talent/feat
- `action` - Character action

## Configuration

The extension supports the following configuration options:

- `holoLSP.maxNumberOfProblems`: Maximum number of problems to show (default: 100)
- `holoLSP.trace.server`: Trace level for server communication (off/messages/verbose)

## Development

### Project Structure

```
.
├── client/                 # Language client
│   ├── src/
│   │   └── extension.ts   # Extension activation code
│   └── package.json       # Client dependencies
├── server/                 # Language server
│   ├── src/
│   │   └── server.ts      # Language server implementation
│   └── package.json       # Server dependencies
├── syntaxes/              # Syntax highlighting
│   └── nwscript.tmLanguage.json
├── vendor/                # PyKotor library
│   └── pykotor/          # KOTOR script definitions
├── language-configuration.json # Language configuration
└── package.json          # Extension manifest
```

### Building

1. Install dependencies: `npm install`
2. Compile TypeScript: `npm run compile`
3. Watch for changes: `npm run watch`

### Debugging

1. Open the project in VS Code
2. Set breakpoints in the TypeScript files
3. Press F5 to launch the Extension Development Host
4. The extension will run with debugging enabled

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

### Areas for Improvement

- **Enhanced PyKotor Integration**: Direct Python integration for loading complete function/constant definitions
- **Advanced Parsing**: More sophisticated syntax analysis and error detection  
- **Code Formatting**: Automatic code formatting capabilities
- **Refactoring Support**: Rename symbols, extract functions, etc.
- **Project Support**: Multi-file project analysis and cross-file references
- **Debugging Integration**: Integration with KOTOR script debugging tools

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [PyKotor](https://github.com/NickHugi/PyKotor) - For providing the comprehensive KOTOR script definitions
- [Microsoft LSP Sample](https://github.com/microsoft/vscode-extension-samples/tree/main/lsp-sample) - For the base LSP implementation
- The KOTOR modding community for their continued support and documentation

## Related Projects

- [PyKotor](https://github.com/NickHugi/PyKotor) - Python library for KOTOR file manipulation
- [KotOR.js](https://github.com/KobaltBlu/KotOR.js) - JavaScript library for KOTOR modding
- [xoreos](https://github.com/xoreos/xoreos) - Open-source engine reimplementation
