#!/usr/bin/env python3
"""
Extract KOTOR/TSL constants and functions from PyKotor scriptdefs.py
and generate TypeScript definitions.

This script was used to generate the kotor-definitions.ts file in early stages to prevent tedious rewriting of already-existing PyKotor definitions.
The current state of kotor-definitions.ts has been fine tuned and refactored to be more readable and maintainable.
"""
from __future__ import annotations

import ast
import sys
from pathlib import Path
from typing import Any


def extract_script_constant(node: ast.Call) -> dict[str, Any] | None:
    """Extract ScriptConstant information from an AST Call node."""
    if (isinstance(node, ast.Call) and 
        isinstance(node.func, ast.Name) and 
        node.func.id == 'ScriptConstant'):
        
        if len(node.args) >= 3:
            # DataType.INT/FLOAT/STRING
            data_type = None
            if (isinstance(node.args[0], ast.Attribute) and
                isinstance(node.args[0].value, ast.Name) and
                node.args[0].value.id == 'DataType'):
                data_type = node.args[0].attr.lower()
            
            # Name (string literal)
            name = None
            if isinstance(node.args[1], ast.Constant):
                name = node.args[1].value
            
            # Value
            value = None
            if isinstance(node.args[2], ast.Constant):
                value = node.args[2].value
            elif (isinstance(node.args[2], ast.Attribute) and
                  isinstance(node.args[2].value, ast.Name) and
                  node.args[2].value.id == 'math' and
                  node.args[2].attr == 'pi'):
                value = 'Math.PI'
            
            if data_type and name and value is not None:
                return {
                    'type': data_type,
                    'name': name,
                    'value': value,
                    'category': infer_category_from_name(name)
                }
    return None

def extract_script_function(node: ast.Call) -> dict[str, Any] | None:
    """Extract ScriptFunction information from an AST Call node."""
    if (isinstance(node, ast.Call) and 
        isinstance(node.func, ast.Name) and 
        node.func.id == 'ScriptFunction'):
        
        if len(node.args) >= 3:
            # Return type (DataType.VOID/INT/etc)
            return_type = None
            if (isinstance(node.args[0], ast.Attribute) and
                isinstance(node.args[0].value, ast.Name) and
                node.args[0].value.id == 'DataType'):
                return_type = node.args[0].attr.lower()
            
            # Function name (string literal)
            name = None
            if isinstance(node.args[1], ast.Constant):
                name = node.args[1].value
            
            # Parameters (list of ScriptParam calls)
            parameters = []
            if isinstance(node.args[2], ast.List):
                for param_node in node.args[2].elts:
                    if (isinstance(param_node, ast.Call) and
                        isinstance(param_node.func, ast.Name) and
                        param_node.func.id == 'ScriptParam' and
                        len(param_node.args) >= 2):
                        
                        # Parameter type
                        param_type = None
                        if (isinstance(param_node.args[0], ast.Attribute) and
                            isinstance(param_node.args[0].value, ast.Name) and
                            param_node.args[0].value.id == 'DataType'):
                            param_type = param_node.args[0].attr.lower()
                        
                        # Parameter name
                        param_name = None
                        if isinstance(param_node.args[1], ast.Constant):
                            param_name = param_node.args[1].value
                        
                        # Default value (from the 3rd argument if present and not None)
                        default_value = None
                        if (len(param_node.args) >= 3 and 
                            not (isinstance(param_node.args[2], ast.Constant) and param_node.args[2].value is None)):
                            if isinstance(param_node.args[2], ast.Constant):
                                default_value = str(param_node.args[2].value)
                        
                        if param_type and param_name:
                            param_dict = {
                                'type': param_type,
                                'name': param_name
                            }
                            if default_value:
                                param_dict['defaultValue'] = default_value
                            parameters.append(param_dict)
            
            # Description (from the 4th argument if present)
            description = f"{name} function" if name else "function"
            if len(node.args) >= 4 and isinstance(node.args[3], ast.Constant):
                desc_text = node.args[3].value
                if isinstance(desc_text, str) and len(desc_text) > 10:
                    # Clean up the description
                    description = desc_text.replace('\\r\\n', ' ').replace('\r\n', ' ')
                    description = ' '.join(description.split())  # Normalize whitespace
                # potentially uncomment if we need to limit the description length
                #    if len(description) > 200:
                #        description = description[:200] + '...'
            
            if return_type and name:
                return {
                    'returnType': return_type,
                    'name': name,
                    'parameters': parameters,
                    'description': description,
                    'category': infer_category_from_function_name(name)
                }
    return None

def infer_category_from_name(name: str) -> str:
    """Infer category from constant name."""
    if name in ['TRUE', 'FALSE']:
        return 'Basic'
    if name == 'PI':
        return 'Math'
    
    # Extract prefix before first underscore
    parts = name.split('_')
    if len(parts) > 1:
        prefix = parts[0]
        if len(parts) > 2 and parts[1] in ['TYPE', 'SLOT', 'BONUS']:
            prefix = f"{parts[0]}_{parts[1]}"
        
        # Convert to title case and singularize
        category = prefix.replace('_', ' ').title()
        if category.endswith('s') and len(category) > 1:
            category = category[:-1]
        return category
    
    return 'Other'

def infer_category_from_function_name(name: str) -> str:
    """Infer category from function name."""
    name_lower = name.lower()
    
    # Core game functions
    if name_lower.startswith(('get', 'set', 'is', 'has')):
        # Object/Character functions
        if any(keyword in name_lower for keyword in ['pc', 'player', 'character', 'object', 'creature']):
            return 'Object'
        # Party functions
        elif any(keyword in name_lower for keyword in ['party', 'npc', 'available']):
            return 'Party'
        # Item/Inventory functions
        elif any(keyword in name_lower for keyword in ['item', 'inventory', 'equipped']):
            return 'Item'
        # Location/Area functions
        elif any(keyword in name_lower for keyword in ['area', 'location', 'position', 'facing']):
            return 'Location'
        # Ability/Skill functions
        elif any(keyword in name_lower for keyword in ['ability', 'skill', 'level', 'class']):
            return 'Character'
        # Global variable functions
        elif any(keyword in name_lower for keyword in ['global', 'local']):
            return 'Variable'
        # Time/Game state functions
        elif any(keyword in name_lower for keyword in ['time', 'day', 'hour', 'module']):
            return 'Game State'
    
    # Action functions
    elif name_lower.startswith('action'):
        return 'Action'
    
    # Effect functions
    elif name_lower.startswith('effect') or 'effect' in name_lower:
        return 'Effect'
    
    # Combat functions
    elif any(keyword in name_lower for keyword in ['damage', 'attack', 'combat', 'weapon', 'armor']):
        return 'Combat'
    
    # Conversation/Dialog functions
    elif any(keyword in name_lower for keyword in ['speak', 'conversation', 'dialog']):
        return 'Dialog'
    
    # Visual/Audio functions
    elif any(keyword in name_lower for keyword in ['play', 'sound', 'music', 'visual', 'camera']):
        return 'Audio/Visual'
    
    # Movement functions
    elif any(keyword in name_lower for keyword in ['move', 'jump', 'teleport', 'walk']):
        return 'Movement'
    
    # Script/Event functions
    elif any(keyword in name_lower for keyword in ['execute', 'script', 'event', 'signal']):
        return 'Script'
    
    # Math functions
    elif any(keyword in name_lower for keyword in ['random', 'float', 'int', 'vector', 'distance']):
        return 'Math'
    
    # Store/Save functions
    elif any(keyword in name_lower for keyword in ['store', 'save', 'load']):
        return 'Save/Load'
    
    # Force power functions (KOTOR specific)
    elif any(keyword in name_lower for keyword in ['force', 'power']):
        return 'Force'
    
    # Default category
    return 'General'

def generate_description(name: str, category: str, fallback: str) -> str:
    """Generate description with fallback logic."""
    descriptions = {
        # Specific names
        'TRUE': 'Boolean true value',
        'FALSE': 'Boolean false value',
        'PI': 'Mathematical constant π',
        
        # Categories
        'Planet': 'Planet identifier constant',
        'Damage': 'Damage type constant',
        'Damage Type': 'Damage type constant',
        'Ability': 'Ability score constant',
        'Skill': 'Skill identifier constant',
        'Feat': 'Feat identifier constant',
        'Animation': 'Animation constant',
        'Base Item': 'Base item type constant',
        'Inventory': 'Inventory slot constant',
        'Inventory Slot': 'Inventory slot constant',
        'Object Type': 'Object type constant',
        'Race': 'Racial type constant',
        'Gender': 'Gender constant',
        'Saving Throw': 'Saving throw constant',
        'Alignment': 'Alignment constant',
        'Duration': 'Duration type constant',
        'Direction': 'Direction constant in degrees',
        'Force Power': 'Force power identifier',
        'Vfx': 'Visual effect constant',
        'Item Property': 'Item property constant',
        'Combat': 'Combat-related constant',
        'Npc': 'NPC identifier constant',
        'Party': 'Party management constant',
        'Camera': 'Camera mode constant',
        'Difficulty': 'Game difficulty constant',
        'Encounter': 'Encounter constant',
        'Trap': 'Trap type constant',
        'Creature': 'Creature size constant',
        'Effect': 'Effect type constant',
        'Conversation': 'Conversation type constant',
        'Disguise': 'Disguise type constant',
        'Immunity': 'Immunity type constant',
        'Aoe': 'Area of effect constant',
        'Polymorph': 'Polymorph type constant',
        'Communication': 'Communication volume constant',
        'Attitude': 'Attitude constant'
    }
    
    return descriptions.get(name, descriptions.get(category, fallback))

def extract_definitions_from_file(file_path: Path) -> dict[str, list[dict[str, Any]]]:
    """Extract all definitions from the scriptdefs.py file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    tree = ast.parse(content)
    
    # Find the target assignments
    target_vars = ['KOTOR_CONSTANTS', 'TSL_CONSTANTS', 'KOTOR_FUNCTIONS', 'TSL_FUNCTIONS']
    definitions = {var: [] for var in target_vars}
    
    for node in ast.walk(tree):
        if (isinstance(node, ast.Assign) and
            len(node.targets) == 1 and
            isinstance(node.targets[0], ast.Name) and
            node.targets[0].id in target_vars):
            
            var_name = node.targets[0].id
            
            if isinstance(node.value, ast.List):
                for item in node.value.elts:
                    if 'CONSTANTS' in var_name:
                        constant = extract_script_constant(item)
                        if constant:
                            definitions[var_name].append(constant)
                    elif 'FUNCTIONS' in var_name:
                        function = extract_script_function(item)
                        if function:
                            definitions[var_name].append(function)
    
    return definitions

def generate_typescript_definitions(definitions: dict[str, list[dict[str, Any]]]) -> str:
    """Generate TypeScript definitions from extracted data."""
    ts_content = """// Generated from PyKotor scriptdefs.py
// Do not edit manually - this file is auto-generated

export interface NWScriptConstant {
  name: string;
  type: string;
  value: number | string;
  description: string;
  category: string;
}

export interface NWScriptParameter {
  name: string;
  type: string;
  description?: string;
  defaultValue?: string;
}

export interface NWScriptFunction {
  name: string;
  returnType: string;
  parameters: NWScriptParameter[];
  description: string;
  category: string;
}

export interface NWScriptType {
  name: string;
  description?: string;
  size?: number;
}

// KOTOR Data Types
export const KOTOR_TYPES: NWScriptType[] = [
  { name: "void", description: "No return value", size: 0 },
  { name: "int", description: "32-bit signed integer", size: 4 },
  { name: "float", description: "32-bit floating point number", size: 4 },
  { name: "string", description: "Text string", size: 4 },
  { name: "object", description: "Game object reference", size: 4 },
  { name: "vector", description: "3D vector with x, y, z components", size: 12 },
  { name: "location", description: "Position and orientation in an area", size: 4 },
  { name: "event", description: "Game event", size: 4 },
  { name: "effect", description: "Game effect", size: 4 },
  { name: "itemproperty", description: "Item property", size: 4 },
  { name: "talent", description: "Character talent/feat", size: 4 },
  { name: "action", description: "Character action", size: 4 },
];

// Keywords for syntax highlighting and completion
export const KOTOR_KEYWORDS = [
  'if', 'else', 'while', 'for', 'do', 'switch', 'case', 'default', 'break',
  'continue', 'return', 'struct', 'const', '#include'
];

// Control Keywords (from compiler)
export const CONTROL_KEYWORDS = [
  'break', 'case', 'default', 'do', 'else', 'switch', 'while', 'for', 'if', 'return'
];

// Operators (from compiler)
export const OPERATORS = [
  '+', '-', '*', '/', '%', '!', '==', '!=', '>', '<', '>=', '<=',
  '&&', '||', '&', '|', '^', '<<', '>>', '~', '++', '--',
  '+=', '-=', '*=', '/='
];

// Data Type Enums (from PyKotor compiler)
export enum DataTypeEnum {
  VOID = 'void',
  INT = 'int',
  FLOAT = 'float',
  STRING = 'string',
  OBJECT = 'object',
  VECTOR = 'vector',
  LOCATION = 'location',
  EVENT = 'event',
  EFFECT = 'effect',
  ITEMPROPERTY = 'itemproperty',
  TALENT = 'talent',
  ACTION = 'action',
  STRUCT = 'struct'
}

// Geometry Support (from PyKotor geometry)
export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface AxisAngle {
  axis: Vector3;
  angle: number;
}

// Surface Material Types (from PyKotor geometry)
export enum SurfaceMaterial {
  UNDEFINED = 0,
  DIRT = 1,
  OBSCURING = 2,
  GRASS = 3,
  STONE = 4,
  WOOD = 5,
  WATER = 6,
  NON_WALK = 7,
  TRANSPARENT = 8,
  CARPET = 9,
  METAL = 10,
  PUDDLES = 11,
  SWAMP = 12,
  MUD = 13,
  LEAVES = 14,
  LAVA = 15,
  BOTTOMLESS_PIT = 16,
  DEEP_WATER = 17,
  DOOR = 18,
  NON_WALK_GRASS = 19,
  TRIGGER = 30
}

// Get all constants by category
export function getConstantsByCategory(category: string): NWScriptConstant[] {
  return KOTOR_CONSTANTS.filter(c => c.category === category);
}

// Get all functions by category
export function getFunctionsByCategory(category: string): NWScriptFunction[] {
  return KOTOR_FUNCTIONS.filter(f => f.category === category);
}

// Find constant by name
export function findConstant(name: string): NWScriptConstant | undefined {
  return KOTOR_CONSTANTS.find(c => c.name === name);
}

// Find function by name
export function findFunction(name: string): NWScriptFunction | undefined {
  return KOTOR_FUNCTIONS.find(f => f.name === name);
}

// Get all available categories
export function getConstantCategories(): string[] {
  return [...new Set(KOTOR_CONSTANTS.map(c => c.category).filter((category): category is string => Boolean(category)))];
}

export function getFunctionCategories(): string[] {
  return [...new Set(KOTOR_FUNCTIONS.map(f => f.category).filter((category): category is string => Boolean(category)))];
}

// Utility functions for geometry types
export function createVector2(x: number, y: number): Vector2 {
  return { x, y };
}

export function createVector3(x: number, y: number, z: number): Vector3 {
  return { x, y, z };
}

export function createVector4(x: number, y: number, z: number, w: number): Vector4 {
  return { x, y, z, w };
}

// Check if surface material is walkable
export function isWalkableSurface(material: SurfaceMaterial): boolean {
  return [
    SurfaceMaterial.DIRT,
    SurfaceMaterial.GRASS,
    SurfaceMaterial.STONE,
    SurfaceMaterial.WOOD,
    SurfaceMaterial.WATER,
    SurfaceMaterial.CARPET,
    SurfaceMaterial.METAL,
    SurfaceMaterial.PUDDLES,
    SurfaceMaterial.SWAMP,
    SurfaceMaterial.MUD,
    SurfaceMaterial.LEAVES,
    SurfaceMaterial.DOOR,
    SurfaceMaterial.TRIGGER
  ].includes(material);
}

// Get data type size (from PyKotor script.py)
export function getDataTypeSize(dataType: DataTypeEnum): number {
  switch (dataType) {
    case DataTypeEnum.VOID:
      return 0;
    case DataTypeEnum.VECTOR:
      return 12;
    case DataTypeEnum.STRUCT:
      throw new Error('Structs are variable size');
    default:
      return 4;
  }
}

// Additional utility functions for NWScript development
export function isValidDataType(type: string): boolean {
  return Object.values(DataTypeEnum).includes(type as DataTypeEnum);
}

export function getDataTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    'void': 'No return value',
    'int': '32-bit signed integer',
    'float': '32-bit floating point number',
    'string': 'Text string',
    'object': 'Game object reference',
    'vector': '3D vector with x, y, z components',
    'location': 'Position and orientation in an area',
    'event': 'Game event',
    'effect': 'Game effect',
    'itemproperty': 'Item property',
    'talent': 'Character talent/feat',
    'action': 'Character action',
    'struct': 'Custom data structure'
  };
  return descriptions[type] || 'Unknown data type';
}

"""
    
    # Generate constants
    for const_type in ['KOTOR_CONSTANTS', 'TSL_CONSTANTS']:
        constants = definitions[const_type]
        fallback = 'kotor constant' if 'KOTOR' in const_type else 'tsl constant'
        
        ts_content += f"export const {const_type}: NWScriptConstant[] = [\n"
        for i, const in enumerate(constants):
            desc = generate_description(const['name'], const['category'], fallback)
            value = const['value']
            if isinstance(value, str) and value != 'Math.PI':
                value = f'"{value}"'
            
            ts_content += f'  {{ name: "{const["name"]}", type: "{const["type"]}", value: {value}, description: "{desc}", category: "{const["category"]}" }}'
            if i < len(constants) - 1:
                ts_content += ','
            ts_content += '\n'
        ts_content += '];\n\n'
    
    # Generate functions
    for func_type in ['KOTOR_FUNCTIONS', 'TSL_FUNCTIONS']:
        functions = definitions[func_type]
        fallback = 'kotor function' if 'KOTOR' in func_type else 'tsl function'
        
        ts_content += f"export const {func_type}: NWScriptFunction[] = [\n"
        for i, func in enumerate(functions):
            desc = generate_description(func['name'], func.get('category'), fallback)
            if func['description'] and len(func['description']) > len(fallback):
                desc = func['description'].replace('"', '\\"')
            
            params = ', '.join([
                f'{{ name: "{p["name"]}", type: "{p["type"]}"' + 
                (f', defaultValue: "{p["defaultValue"]}"' if p.get('defaultValue') else '') + ' }'
                for p in func['parameters']
            ])
            
            ts_content += f'  {{ name: "{func["name"]}", returnType: "{func["returnType"]}", parameters: [{params}], description: "{desc}", category: "{func["category"]}" }}'
            if i < len(functions) - 1:
                ts_content += ','
            ts_content += '\n'
        ts_content += '];\n\n'
    
    return ts_content

def main() -> None:
    # Get the script directory
    script_dir = Path(__file__).parent
    output_dir = Path(__file__).parent.parent / 'server' / 'src'
    
    # Path to the scriptdefs.py file
    scriptdefs_path = script_dir.parent / 'vendor' / 'pykotor' / 'common' / 'scriptdefs.py'
    
    if not scriptdefs_path.exists():
        print(f"Error: {scriptdefs_path} not found")
        sys.exit(1)
    
    print("Extracting definitions from PyKotor scriptdefs.py...")
    
    try:
        definitions = extract_definitions_from_file(scriptdefs_path)
        
        # Print summary
        for var_name, items in definitions.items():
            print(f"Found {len(items)} items in {var_name}")
        
        # Generate TypeScript
        ts_content = generate_typescript_definitions(definitions)
        
        # Write output file
        #output_path = script_dir / 'generated-definitions.ts'
        output_path = output_dir / 'kotor-definitions.ts'
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(ts_content)
        
        print(f"Generated TypeScript definitions in {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
