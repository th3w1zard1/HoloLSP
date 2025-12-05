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
export declare const KOTOR_TYPES: NWScriptType[];
export declare const KOTOR_KEYWORDS: string[];
export declare const CONTROL_KEYWORDS: string[];
export declare const OPERATORS: string[];
export declare enum DataTypeEnum {
    VOID = "void",
    INT = "int",
    FLOAT = "float",
    STRING = "string",
    OBJECT = "object",
    VECTOR = "vector",
    LOCATION = "location",
    EVENT = "event",
    EFFECT = "effect",
    ITEMPROPERTY = "itemproperty",
    TALENT = "talent",
    ACTION = "action",
    STRUCT = "struct"
}
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
export declare enum SurfaceMaterial {
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
export declare function getConstantsByCategory(category: string): NWScriptConstant[];
export declare function getFunctionsByCategory(category: string): NWScriptFunction[];
export declare function findConstant(name: string): NWScriptConstant | undefined;
export declare function findFunction(name: string): NWScriptFunction | undefined;
export declare function getConstantCategories(): string[];
export declare function getFunctionCategories(): string[];
export declare function createVector2(x: number, y: number): Vector2;
export declare function createVector3(x: number, y: number, z: number): Vector3;
export declare function createVector4(x: number, y: number, z: number, w: number): Vector4;
export declare function isWalkableSurface(material: SurfaceMaterial): boolean;
export declare function getDataTypeSize(dataType: DataTypeEnum): number;
export declare function isValidDataType(type: string): boolean;
export declare function getDataTypeDescription(type: string): string;
export declare const KOTOR_CONSTANTS: NWScriptConstant[];
export declare const TSL_CONSTANTS: NWScriptConstant[];
export declare const KOTOR_FUNCTIONS: NWScriptFunction[];
export declare const TSL_FUNCTIONS: NWScriptFunction[];
//# sourceMappingURL=kotor-definitions.d.ts.map