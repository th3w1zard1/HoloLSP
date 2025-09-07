# HoloLSP Architecture Documentation

## Overview

HoloLSP is a Language Server Protocol (LSP) extension for Visual Studio Code that provides comprehensive language support for NWScript, specifically tailored for Star Wars: Knights of the Old Republic (KOTOR) and The Sith Lords (TSL).

## Architecture Diagram

```bash
┌─────────────────────────────────────────────────────────────┐
│                    VS Code Extension Host                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                 ┌─────────────────────┐ │
│  │   Client Side   │◄─── IPC ────────┤   Language Server   │ │
│  │  (extension.ts) │                 │    (server.ts)      │ │
│  └─────────────────┘                 └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │            KOTOR Definitions (TypeScript)               │ │
│  │  • Constants (70+)  • Functions (40+)  • Types (12)    │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Syntax & Language Config                   │ │
│  │  • TextMate Grammar  • Language Config  • File Assoc   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Client Side (`client/src/extension.ts`)

**Responsibilities:**

- Extension activation and lifecycle management
- Language client initialization
- File association configuration
- Communication setup with language server

**Key Features:**

- Registers `.nss` and `.ncs` file associations
- Configures document selectors for NWScript files
- Manages server startup and shutdown
- Handles extension configuration changes

### 2. Language Server (`server/src/server.ts`)

**Responsibilities:**

- LSP protocol implementation
- Document analysis and validation
- IntelliSense and completion providers
- Error detection and diagnostics

**Key Features:**

- **Completion Provider**: Offers suggestions for constants, functions, types, and keywords
- **Diagnostic Provider**: Detects syntax errors and undefined function warnings
- **Hover Provider**: Framework for showing symbol documentation
- **Signature Help**: Framework for function parameter hints

### 3. KOTOR Definitions (`server/src/kotor-definitions.ts`)

**Responsibilities:**

- Centralized KOTOR-specific language data
- Type definitions and interfaces
- Utility functions for data access

**Data Structure:**

```typescript
interface NWScriptConstant {
  name: string;
  type: 'int' | 'float' | 'string' | 'object';
  value: any;
  description?: string;
  category?: string;
}

interface NWScriptFunction {
  name: string;
  returnType: string;
  parameters: Array<{
    name: string;
    type: string;
    defaultValue?: string;
    description?: string;
  }>;
  description?: string;
  category?: string;
}
```

**Categories:**

- **Constants**: Basic, Objects, Damage, Abilities, Planets, NPCs, Base Items, Animation, Alignment
- **Functions**: Debug, Objects, Actions, Character, Variables, Math, Effects, Party

### 4. Syntax Highlighting (`syntaxes/nwscript.tmLanguage.json`)

**Responsibilities:**

- TextMate grammar definition for NWScript
- Syntax highlighting rules and patterns
- Token classification and scoping

**Supported Elements:**

- Comments (line and block)
- Keywords and control structures
- Data types and storage modifiers
- Constants and literals
- Functions and operators
- Preprocessor directives

### 5. Language Configuration (`language-configuration.json`)

**Responsibilities:**

- Editor behavior configuration
- Bracket matching and auto-closing
- Comment definitions
- Indentation rules

## Data Flow

### 1. Extension Activation

```
User opens .nss file → VS Code activates extension → Client starts language server
```

### 2. IntelliSense Request

```
User types → Client sends completion request → Server analyzes context → 
Server queries KOTOR definitions → Server returns completion items → 
Client displays suggestions
```

### 3. Error Detection

```
Document changes → Server validates syntax → Server checks function definitions → 
Server generates diagnostics → Client displays error markers
```

## LSP Features Implementation

### Completed Features

1. **Text Document Synchronization**
   - Incremental sync for performance
   - Document change tracking
   - Real-time validation

2. **Completion Provider**
   - Context-aware suggestions
   - Categorized completion items
   - Detailed documentation

3. **Diagnostic Provider**
   - Basic syntax validation
   - Undefined function detection
   - Brace matching checks

### Framework in Place

1. **Hover Provider**
   - Infrastructure ready
   - Needs symbol resolution implementation

2. **Signature Help**
   - Framework established
   - Needs parameter parsing implementation

### Future Enhancements

1. **Go to Definition**
2. **Find References**
3. **Document Symbols**
4. **Workspace Symbols**
5. **Code Actions**
6. **Formatting**

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Definitions loaded once at startup
   - Cached for subsequent requests

2. **Incremental Parsing**
   - Only reparse changed sections
   - Maintain syntax tree state

3. **Efficient Data Structures**
   - Hash maps for constant/function lookup
   - Categorized organization for filtering

### Memory Management

- **Constant Memory**: ~50KB for all definitions
- **Per-Document**: Minimal overhead for validation state
- **Caching**: Smart caching of parsed results

## Extension Points

### Adding New Constants

```typescript
// In kotor-definitions.ts
{
  name: "NEW_CONSTANT",
  type: "int",
  value: 123,
  description: "Description of the constant",
  category: "Category Name"
}
```

### Adding New Functions

```typescript
// In kotor-definitions.ts
{
  name: "NewFunction",
  returnType: "returnType",
  parameters: [
    { name: "param", type: "paramType", description: "Parameter description" }
  ],
  description: "Function description",
  category: "Function Category"
}
```

### Extending Syntax Highlighting

```json
// In nwscript.tmLanguage.json
{
  "name": "keyword.new.nwscript",
  "match": "\\b(newkeyword)\\b"
}
```

## Testing Strategy

### Manual Testing

1. Extension Development Host (F5)
2. Test files in `examples/` directory
3. Feature verification checklist

### Automated Testing (Future)

1. Unit tests for language server logic
2. Integration tests for LSP features
3. Performance benchmarks

## Security Considerations

1. **No External Dependencies**: Pure TypeScript implementation
2. **Sandboxed Execution**: Runs in VS Code's extension host
3. **No Network Access**: All data is local
4. **Input Validation**: Proper parsing and validation of user input

## Build and Deployment

### Development Build

```bash
npm install       # Install dependencies
npm run compile   # Compile TypeScript
```

### Production Build

```bash
npm run compile   # Compile for production
vsce package      # Create .vsix file
```

### Continuous Integration

- TypeScript compilation checks
- Linting and code style validation
- Extension packaging tests

## Dependencies

### Runtime Dependencies

- `vscode-languageserver`: LSP server implementation
- `vscode-languageserver-textdocument`: Document management
- `vscode-languageclient`: LSP client implementation (client-side)

### Development Dependencies

- `typescript`: TypeScript compiler
- `@types/vscode`: VS Code API type definitions
- `@types/node`: Node.js type definitions

## Configuration

### Extension Settings

```json
{
  "holoLSP.maxNumberOfProblems": 100,
  "holoLSP.trace.server": "off"
}
```

### File Associations

```json
{
  "files.associations": {
    "*.nss": "nwscript",
    "*.ncs": "nwscript"
  }
}
```

This architecture provides a solid foundation for KOTOR NWScript development while maintaining extensibility for future enhancements and optimizations.
