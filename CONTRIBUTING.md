# Contributing to HoloLSP

Thank you for your interest in contributing to HoloLSP, the KOTOR NWScript Language Server Protocol extension! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Adding KOTOR Content](#adding-kotor-content)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- Visual Studio Code
- Basic understanding of TypeScript
- Familiarity with KOTOR/TSL modding (helpful but not required)

### Development Setup

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

4. **Start development:**
   - Open the project in VS Code
   - Press `F5` to launch the Extension Development Host
   - Open a `.nss` file to test the extension

## Project Structure

```
HoloLSP/
├── client/                     # VS Code extension client
│   ├── src/extension.ts       # Extension activation logic
│   └── package.json           # Client dependencies
├── server/                     # Language server implementation
│   ├── src/
│   │   ├── server.ts          # Main LSP server logic
│   │   └── kotor-definitions.ts # KOTOR constants, functions, types
│   └── package.json           # Server dependencies
├── syntaxes/                   # Syntax highlighting
│   └── nwscript.tmLanguage.json # TextMate grammar
├── examples/                   # Sample NWScript files
├── language-configuration.json # Language configuration
└── package.json               # Main extension manifest
```

## Adding KOTOR Content

### Adding Constants

Constants are defined in `server/src/kotor-definitions.ts` in the `KOTOR_CONSTANTS` array:

```typescript
{
  name: "CONSTANT_NAME",
  type: "int" | "float" | "string" | "object",
  value: actualValue,
  description: "Brief description of what this constant represents",
  category: "Category Name" // e.g., "Damage", "Planets", "NPCs", etc.
}
```

**Example:**

```typescript
{
  name: "PLANET_KORRIBAN",
  type: "int",
  value: 25,
  description: "Korriban planet constant for global variable tracking",
  category: "Planets"
}
```

### Adding Functions

Functions are defined in `server/src/kotor-definitions.ts` in the `KOTOR_FUNCTIONS` array:

```typescript
{
  name: "FunctionName",
  returnType: "void" | "int" | "float" | "string" | "object" | "vector" | etc.,
  parameters: [
    { 
      name: "parameterName", 
      type: "parameterType", 
      defaultValue?: "defaultValue", // Optional
      description?: "Parameter description" // Optional
    }
  ],
  description: "What this function does and when to use it",
  category: "Function Category" // e.g., "Actions", "Objects", "Character", etc.
}
```

**Example:**

```typescript
{
  name: "GetPartyMemberByIndex",
  returnType: "object",
  parameters: [
    { 
      name: "nIndex", 
      type: "int", 
      description: "Index of party member (0-based)" 
    }
  ],
  description: "Gets a party member by their index in the party list",
  category: "Party"
}
```

### Categories

Use these standard categories to keep content organized:

**Constants:**

- `Basic` - TRUE, FALSE, etc.
- `Objects` - OBJECT_SELF, OBJECT_INVALID, etc.
- `Damage` - Damage type constants
- `Abilities` - Ability score constants
- `Planets` - KOTOR planet constants
- `NPCs` - Party member constants
- `Base Items` - Item type constants
- `Animation` - Animation constants
- `Alignment` - Light/Dark side constants

**Functions:**

- `Debug` - PrintString, etc.
- `Objects` - GetObjectByTag, GetName, etc.
- `Actions` - ActionMoveToObject, etc.
- `Character` - GetHitDice, GetAbilityScore, etc.
- `Variables` - Global variable functions
- `Math` - Vector, Location, etc.
- `Effects` - Effect creation and application
- `Party` - KOTOR-specific party management

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Prefer `const` over `let` when possible
- Use descriptive variable and function names
- Add JSDoc comments for public APIs
- Use 2-space indentation for TypeScript files

### NWScript Examples

- Use 4-space indentation for `.nss` files
- Follow KOTOR modding conventions
- Include meaningful comments explaining KOTOR-specific logic
- Use descriptive variable names (Hungarian notation is optional)

### General

- Keep lines under 120 characters
- Use meaningful commit messages
- Write self-documenting code
- Add comments for complex logic

## Testing

### Manual Testing

1. Press `F5` in VS Code to launch Extension Development Host
2. Create or open a `.nss` file
3. Test the following features:
   - **Syntax Highlighting**: Code should be properly colored
   - **IntelliSense**: `Ctrl+Space` should show completions
   - **Error Detection**: Invalid syntax should show red squiggles
   - **Hover Information**: Hovering over symbols should show documentation

### Test Cases to Verify

- [ ] Constants appear in completion (try typing `PLANET_`)
- [ ] Functions appear in completion (try typing `Get`)
- [ ] Syntax highlighting works for keywords, strings, numbers
- [ ] File association works (`.nss` files use nwscript language)
- [ ] Error detection shows warnings for undefined functions
- [ ] Categories are properly organized in completion

### Creating Test Files

Add test files to the `examples/` directory:

- Use realistic KOTOR scripting scenarios
- Include comments explaining the purpose
- Test various language features
- Include both valid and invalid syntax for testing

## Submitting Changes

### Before Submitting

1. **Test thoroughly** using the Extension Development Host
2. **Run the compiler** to ensure no TypeScript errors
3. **Check code style** matches project conventions
4. **Update documentation** if adding new features
5. **Add examples** if adding significant functionality

### Pull Request Process

1. **Fork the repository** and create a feature branch
2. **Make your changes** following the guidelines above
3. **Test your changes** thoroughly
4. **Write a clear commit message** describing what you changed
5. **Submit a pull request** with:
   - Clear description of changes
   - Why the changes are needed
   - Any testing you performed
   - Screenshots if UI changes are involved

### Commit Message Format

```
type(scope): brief description

Longer explanation if needed

- Specific changes made
- Why changes were necessary
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(constants): add TSL planet constants

Added planet constants for KOTOR II locations including
Peragus, Telos, Nar Shaddaa, Onderon, and Malachor V

- Added 15 new planet constants to KOTOR_CONSTANTS
- Updated examples with TSL-specific scripting patterns
```

## KOTOR/TSL Specific Guidelines

### Research Sources

When adding KOTOR content, verify accuracy using:

- KOTOR Tool for extracting game files
- NWScript documentation from BioWare
- Community modding resources (Deadly Stream, etc.)
- Existing mod scripts for reference

### Prioritization

Focus on commonly used KOTOR features:

1. **High Priority**: Core gameplay functions, common constants
2. **Medium Priority**: Specialized functions, less common constants
3. **Low Priority**: Deprecated or rarely used features

### KOTOR vs TSL

- Mark TSL-specific content clearly in descriptions
- Use separate categories when features differ significantly
- Prioritize KOTOR 1 content when in doubt (broader compatibility)

## Getting Help

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join KOTOR modding communities for general help
- **Documentation**: Check the README and code comments

## License

By contributing to HoloLSP, you agree that your contributions will be licensed under the LGPL-3.0 license.

Thank you for contributing to HoloLSP and helping make KOTOR modding more accessible!
