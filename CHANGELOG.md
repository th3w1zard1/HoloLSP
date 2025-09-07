# Changelog

All notable changes to the HoloLSP extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial release of HoloLSP for KOTOR NWScript
- Language Server Protocol implementation for `.nss` and `.ncs` files
- Comprehensive KOTOR-specific constants and functions
- IntelliSense support with auto-completion
- Syntax highlighting for NWScript
- Basic error detection and validation
- Support for KOTOR-specific features:
  - Planet constants (PLANET_TARIS, PLANET_DANTOOINE, etc.)
  - Damage types (DAMAGE_TYPE_BLASTER, DAMAGE_TYPE_ION, etc.)
  - NPC constants (NPC_BASTILA, NPC_HK47, etc.)
  - Party management functions
  - Global variable functions
  - KOTOR-specific item types and equipment slots

### Technical Details

- Pure TypeScript implementation (no Python dependencies)
- 70+ KOTOR constants across 10+ categories
- 40+ KOTOR functions across 8+ categories
- Complete NWScript syntax highlighting
- Language configuration for proper editor behavior
- VS Code debugging support for extension development

## [1.0.0] - TBD

### Added

- Initial stable release
- Full KOTOR NWScript language support
- Comprehensive documentation and examples
- Extension ready for VS Code Marketplace

---

## Development Notes

### Version Numbering

- **Major** (X.0.0): Breaking changes, major feature additions
- **Minor** (0.X.0): New features, significant improvements
- **Patch** (0.0.X): Bug fixes, minor improvements

### Categories for Changes

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

### Future Planned Features

- Enhanced error detection and validation
- Signature help for function parameters
- Hover documentation for symbols
- Go to definition support
- Find references functionality
- Code formatting and refactoring
- Integration with KOTOR modding tools
- TSL-specific constants and functions
- Advanced IntelliSense features
- Code snippets for common patterns
- Project-wide symbol analysis
