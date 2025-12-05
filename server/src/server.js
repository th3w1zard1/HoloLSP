"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const kotor_definitions_1 = require("./kotor-definitions");
// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Create a simple text document manager.
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
// Default settings
const defaultSettings = { maxNumberOfProblems: 1000 };
let globalSettings = defaultSettings;
// Cache for settings of all open documents
let documentSettings = new Map();
// Language data storage (using imported KOTOR definitions)
const constants = kotor_definitions_1.KOTOR_CONSTANTS;
const functions = kotor_definitions_1.KOTOR_FUNCTIONS;
const types = kotor_definitions_1.KOTOR_TYPES;
// Initialize language data (now using imported KOTOR definitions)
async function initializeLanguageData() {
    try {
        connection.console.log(`Loaded ${constants.length} KOTOR constants`);
        connection.console.log(`Loaded ${functions.length} KOTOR functions`);
        connection.console.log(`Loaded ${types.length} KOTOR types`);
        connection.console.log("HoloLSP language data initialized successfully with KOTOR definitions");
    }
    catch (error) {
        connection.console.error(`Failed to initialize language data: ${error}`);
    }
}
connection.onInitialize((params) => {
    const result = {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['.', '(']
            },
            hoverProvider: true,
            signatureHelpProvider: {
                triggerCharacters: ['(', ',']
            }
        },
    };
    // Initialize language data
    initializeLanguageData();
    return result;
});
connection.onInitialized(() => {
    connection.console.log("HoloLSP server initialized for KOTOR NWScript");
});
// Document settings management
connection.onDidChangeConfiguration(change => {
    if (hasConfigurationCapability) {
        documentSettings.clear();
    }
    else {
        globalSettings = ((change.settings.holoLSP || defaultSettings));
    }
    documents.all().forEach(validateTextDocument);
});
let hasConfigurationCapability = false;
function getDocumentSettings(resource) {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: 'holoLSP'
        });
        documentSettings.set(resource, result);
    }
    return result;
}
documents.onDidClose(e => {
    documentSettings.delete(e.document.uri);
});
// Validation
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});
async function validateTextDocument(textDocument) {
    const settings = await getDocumentSettings(textDocument.uri);
    const text = textDocument.getText();
    const diagnostics = [];
    const lines = text.split('\n');
    // Track brace balance across the entire document
    let braceBalance = 0;
    let parenBalance = 0;
    let inBlockComment = false;
    let inString = false;
    let stringChar = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line)
            continue;
        const trimmedLine = line.trim();
        // Skip empty lines
        if (trimmedLine === '')
            continue;
        // Process each character for better parsing
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            const prevChar = j > 0 ? line[j - 1] : '';
            const nextChar = j < line.length - 1 ? line[j + 1] : '';
            // Handle string literals
            if (!inBlockComment) {
                if ((char === '"' || char === "'") && prevChar !== '\\') {
                    if (!inString) {
                        inString = true;
                        stringChar = char;
                    }
                    else if (char === stringChar) {
                        inString = false;
                        stringChar = '';
                    }
                }
            }
            // Handle comments (skip parsing inside strings)
            if (!inString) {
                // Block comments
                if (char === '/' && nextChar === '*') {
                    inBlockComment = true;
                    j++; // Skip next character
                    continue;
                }
                if (char === '*' && nextChar === '/' && inBlockComment) {
                    inBlockComment = false;
                    j++; // Skip next character
                    continue;
                }
                // Line comments
                if (char === '/' && nextChar === '/') {
                    break; // Rest of line is comment
                }
                // Skip parsing inside comments
                if (inBlockComment)
                    continue;
                // Track braces and parentheses
                if (char === '{')
                    braceBalance++;
                else if (char === '}')
                    braceBalance--;
                else if (char === '(')
                    parenBalance++;
                else if (char === ')')
                    parenBalance--;
                // Check for negative balance (closing without opening)
                if (braceBalance < 0) {
                    diagnostics.push({
                        severity: node_1.DiagnosticSeverity.Error,
                        range: {
                            start: { line: i, character: j },
                            end: { line: i, character: j + 1 }
                        },
                        message: 'Unexpected closing brace - no matching opening brace',
                        source: 'HoloLSP'
                    });
                    braceBalance = 0; // Reset to prevent cascade errors
                }
                if (parenBalance < 0) {
                    diagnostics.push({
                        severity: node_1.DiagnosticSeverity.Error,
                        range: {
                            start: { line: i, character: j },
                            end: { line: i, character: j + 1 }
                        },
                        message: 'Unexpected closing parenthesis - no matching opening parenthesis',
                        source: 'HoloLSP'
                    });
                    parenBalance = 0; // Reset to prevent cascade errors
                }
            }
        }
        // Check for unterminated strings
        if (inString && !trimmedLine.endsWith('\\')) {
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: i, character: 0 },
                    end: { line: i, character: line.length }
                },
                message: 'Unterminated string literal',
                source: 'HoloLSP'
            });
            inString = false; // Reset for next line
        }
        // Check for undefined functions (improved check)
        if (!inBlockComment && !inString) {
            const functionCallRegex = /([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
            let match;
            while ((match = functionCallRegex.exec(line)) !== null) {
                const functionName = match[1];
                if (!functionName)
                    continue;
                const isKeyword = ['if', 'while', 'for', 'switch', 'do', 'else', 'return'].includes(functionName);
                const isKnownFunction = functions.some(f => f.name === functionName);
                const isDataType = types.some(t => t.name === functionName);
                if (!isKeyword && !isKnownFunction && !isDataType) {
                    diagnostics.push({
                        severity: node_1.DiagnosticSeverity.Warning,
                        range: {
                            start: { line: i, character: match.index },
                            end: { line: i, character: match.index + functionName.length }
                        },
                        message: `Unknown function '${functionName}' - it may not be defined in the current context`,
                        source: 'HoloLSP'
                    });
                }
            }
        }
        // Check for undefined constants/variables (basic check)
        if (!inBlockComment && !inString) {
            const identifierRegex = /\b([A-Z_][A-Z0-9_]{2,})\b/g;
            let match;
            while ((match = identifierRegex.exec(line)) !== null) {
                const identifier = match[1];
                if (!identifier)
                    continue;
                const isKnownConstant = constants.some(c => c.name === identifier);
                const isKeyword = kotor_definitions_1.KOTOR_KEYWORDS.includes(identifier.toLowerCase());
                if (!isKnownConstant && !isKeyword && identifier !== 'OBJECT_SELF' && identifier !== 'OBJECT_INVALID') {
                    diagnostics.push({
                        severity: node_1.DiagnosticSeverity.Information,
                        range: {
                            start: { line: i, character: match.index },
                            end: { line: i, character: match.index + identifier.length }
                        },
                        message: `Unknown constant or variable '${identifier}' - ensure it's defined`,
                        source: 'HoloLSP'
                    });
                }
            }
        }
    }
    // Check for unmatched braces at end of document
    if (braceBalance > 0) {
        diagnostics.push({
            severity: node_1.DiagnosticSeverity.Error,
            range: {
                start: { line: lines.length - 1, character: 0 },
                end: { line: lines.length - 1, character: lines[lines.length - 1]?.length || 0 }
            },
            message: `${braceBalance} unclosed brace(s) - missing closing brace(s)`,
            source: 'HoloLSP'
        });
    }
    if (parenBalance > 0) {
        diagnostics.push({
            severity: node_1.DiagnosticSeverity.Warning,
            range: {
                start: { line: lines.length - 1, character: 0 },
                end: { line: lines.length - 1, character: lines[lines.length - 1]?.length || 0 }
            },
            message: `${parenBalance} unclosed parenthesis(es) - missing closing parenthesis(es)`,
            source: 'HoloLSP'
        });
    }
    // Limit diagnostics to prevent overwhelming the user
    const limitedDiagnostics = diagnostics.slice(0, settings.maxNumberOfProblems);
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: limitedDiagnostics });
}
// Completion provider with context awareness
connection.onCompletion((params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return [];
    }
    const text = document.getText();
    const position = params.position;
    const lines = text.split('\n');
    if (position.line >= lines.length) {
        return [];
    }
    const line = lines[position.line];
    if (!line)
        return [];
    const beforeCursor = line.substring(0, position.character);
    const completionItems = [];
    // Determine context for smarter completions
    const context = analyzeCompletionContext(beforeCursor, lines, position.line);
    // Add constants (filtered by context)
    constants.forEach(constant => {
        if (shouldIncludeConstant(constant, context)) {
            completionItems.push({
                label: constant.name,
                kind: node_1.CompletionItemKind.Constant,
                detail: `${constant.type} = ${constant.value}`,
                documentation: {
                    kind: node_1.MarkupKind.Markdown,
                    value: `**${constant.name}** (${constant.type})\\n\\n${constant.description || `Constant of type ${constant.type}`}\\n\\n*Value:* \`${constant.value}\`${constant.category ? `\\n\\n*Category:* ${constant.category}` : ''}`
                },
                insertText: constant.name,
                sortText: `1_${constant.category || 'other'}_${constant.name}` // Sort by category
            });
        }
    });
    // Add functions (with snippet support)
    functions.forEach(func => {
        if (shouldIncludeFunction(func, context)) {
            const params = func.parameters.map(p => p.defaultValue ? `${p.type} ${p.name} = ${p.defaultValue}` : `${p.type} ${p.name}`).join(', ');
            // Create snippet for function with parameters
            let snippetText = func.name;
            if (func.parameters.length > 0) {
                const snippetParams = func.parameters.map((p, index) => {
                    const placeholder = p.defaultValue ? `\${${index + 1}:${p.defaultValue}}` : `\${${index + 1}:${p.name}}`;
                    return placeholder;
                }).join(', ');
                snippetText = `${func.name}(${snippetParams})`;
            }
            else {
                snippetText = `${func.name}()`;
            }
            completionItems.push({
                label: func.name,
                kind: node_1.CompletionItemKind.Function,
                detail: `${func.returnType} ${func.name}(${params})`,
                documentation: {
                    kind: node_1.MarkupKind.Markdown,
                    value: `**${func.name}** (${func.returnType})\\n\\n\`\`\`nwscript\\n${func.returnType} ${func.name}(${params})\\n\`\`\`\\n\\n${func.description || `Function returning ${func.returnType}`}${func.category ? `\\n\\n*Category:* ${func.category}` : ''}`
                },
                insertText: snippetText,
                insertTextFormat: 2,
                sortText: `2_${func.category || 'other'}_${func.name}`
            });
        }
    });
    // Add types (when appropriate)
    if (context.expectingType) {
        types.forEach(type => {
            completionItems.push({
                label: type.name,
                kind: node_1.CompletionItemKind.TypeParameter,
                detail: `Type: ${type.name}`,
                documentation: type.description || `Data type ${type.name}`,
                insertText: type.name,
                sortText: `0_${type.name}`
            });
        });
    }
    // Add keywords (context-sensitive)
    kotor_definitions_1.KOTOR_KEYWORDS.forEach(keyword => {
        if (shouldIncludeKeyword(keyword, context)) {
            completionItems.push({
                label: keyword,
                kind: node_1.CompletionItemKind.Keyword,
                detail: `Keyword: ${keyword}`,
                insertText: keyword,
                sortText: `3_${keyword}`
            });
        }
    });
    // Add context-specific suggestions
    if (context.inFunctionCall && context.functionName) {
        // Add parameter hints or related constants
        const func = (0, kotor_definitions_1.findFunction)(context.functionName);
        if (func && context.parameterIndex !== undefined && context.parameterIndex < func.parameters.length) {
            const param = func.parameters[context.parameterIndex];
            if (param) {
                // Suggest constants that match the parameter type
                constants.forEach(constant => {
                    if (constant.type === param.type || (param.type === 'int' && constant.type === 'int')) {
                        completionItems.push({
                            label: constant.name,
                            kind: node_1.CompletionItemKind.Value,
                            detail: `${constant.type} = ${constant.value} (for ${param.name})`,
                            documentation: `Suggested for parameter '${param.name}' of type ${param.type}`,
                            insertText: constant.name,
                            sortText: `0_param_${constant.name}`
                        });
                    }
                });
            }
        }
    }
    return completionItems;
});
// Helper function to analyze completion context
function analyzeCompletionContext(beforeCursor, lines, currentLine) {
    const context = {
        expectingType: false,
        inFunctionCall: false,
        functionName: null,
        parameterIndex: null,
        afterDot: false,
        inString: false,
        inComment: false
    };
    // Check if we're expecting a type declaration
    const typeKeywords = ['int', 'float', 'string', 'object', 'vector', 'location', 'void'];
    const beforeWords = beforeCursor.trim().split(/\\s+/);
    const lastWord = beforeWords[beforeWords.length - 1];
    if (beforeWords.length > 0) {
        const secondLastWord = beforeWords[beforeWords.length - 2];
        if (secondLastWord && typeKeywords.includes(secondLastWord)) {
            context.expectingType = false; // We're after a type, expecting variable name
        }
        else if (beforeCursor.match(/^\\s*(int|float|string|object|vector|location|void)?\\s*$/)) {
            context.expectingType = true;
        }
    }
    // Check if we're in a function call
    const functionCallMatch = beforeCursor.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*$/);
    if (functionCallMatch && functionCallMatch[1]) {
        context.inFunctionCall = true;
        context.functionName = functionCallMatch[1];
        // Count parameters to determine which parameter we're completing
        const afterFunctionName = beforeCursor.substring(beforeCursor.lastIndexOf(context.functionName) + context.functionName.length);
        const openParenIndex = afterFunctionName.indexOf('(');
        if (openParenIndex !== -1) {
            const insideParens = afterFunctionName.substring(openParenIndex + 1);
            context.parameterIndex = (insideParens.match(/,/g) || []).length;
        }
    }
    // Check if we're after a dot (object property access)
    context.afterDot = beforeCursor.endsWith('.');
    // Check if we're in a string or comment (simplified check)
    const lineUpToCursor = beforeCursor;
    const stringMatches = lineUpToCursor.match(/"/g);
    context.inString = stringMatches && stringMatches.length % 2 === 1;
    context.inComment = lineUpToCursor.includes('//') || lineUpToCursor.includes('/*');
    return context;
}
// Helper functions to determine what to include in completions
function shouldIncludeConstant(constant, context) {
    if (context.inString || context.inComment)
        return false;
    return true;
}
function shouldIncludeFunction(func, context) {
    if (context.inString || context.inComment)
        return false;
    if (context.expectingType && func.returnType !== 'void')
        return true;
    return !context.expectingType;
}
function shouldIncludeKeyword(keyword, context) {
    if (context.inString || context.inComment)
        return false;
    if (context.inFunctionCall)
        return false; // Don't suggest keywords inside function calls
    return true;
}
// Completion resolve provider
connection.onCompletionResolve((item) => {
    return item;
});
// Hover provider
connection.onHover((params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return null;
    }
    const text = document.getText();
    const position = params.position;
    const lines = text.split('\n');
    if (position.line >= lines.length) {
        return null;
    }
    const line = lines[position.line];
    const wordRange = getWordRangeAtPosition(line || '', position.character);
    if (!wordRange) {
        return null;
    }
    const word = (line || '').substring(wordRange.start, wordRange.end);
    // Check if it's a constant
    const constant = (0, kotor_definitions_1.findConstant)(word);
    if (constant) {
        return {
            contents: {
                kind: node_1.MarkupKind.Markdown,
                value: `**${constant.name}** (${constant.type})\n\n${constant.description || 'KOTOR constant'}\n\n*Value:* \`${constant.value}\`${constant.category ? `\n\n*Category:* ${constant.category}` : ''}`
            },
            range: {
                start: { line: position.line, character: wordRange.start },
                end: { line: position.line, character: wordRange.end }
            }
        };
    }
    // Check if it's a function
    const func = (0, kotor_definitions_1.findFunction)(word);
    if (func) {
        const params = func.parameters.map(p => p.defaultValue ? `${p.type} ${p.name} = ${p.defaultValue}` : `${p.type} ${p.name}`).join(', ');
        return {
            contents: {
                kind: node_1.MarkupKind.Markdown,
                value: `**${func.name}** (${func.returnType})\n\n\`\`\`nwscript\n${func.returnType} ${func.name}(${params})\n\`\`\`\n\n${func.description || 'KOTOR function'}${func.category ? `\n\n*Category:* ${func.category}` : ''}`
            },
            range: {
                start: { line: position.line, character: wordRange.start },
                end: { line: position.line, character: wordRange.end }
            }
        };
    }
    return null;
});
// Helper function to get word range at position
function getWordRangeAtPosition(line, character) {
    if (!line || character < 0 || character >= line.length) {
        return null;
    }
    // Find word boundaries
    let start = character;
    let end = character;
    // Move start backward to find word start
    while (start > 0) {
        const prevChar = line[start - 1];
        if (!prevChar || !/[a-zA-Z0-9_]/.test(prevChar))
            break;
        start--;
    }
    // Move end forward to find word end
    while (end < line.length) {
        const char = line[end];
        if (!char || !/[a-zA-Z0-9_]/.test(char))
            break;
        end++;
    }
    if (start === end) {
        return null;
    }
    return { start, end };
}
// Signature help provider
connection.onSignatureHelp((params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return null;
    }
    const text = document.getText();
    const position = params.position;
    const lines = text.split('\n');
    if (position.line >= lines.length) {
        return null;
    }
    const line = lines[position.line];
    if (!line)
        return null;
    const beforeCursor = line.substring(0, position.character);
    // Find the function call context
    const functionCallMatch = beforeCursor.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*$/);
    if (!functionCallMatch) {
        return null;
    }
    const functionName = functionCallMatch[1];
    if (!functionName)
        return null;
    const func = (0, kotor_definitions_1.findFunction)(functionName);
    if (!func) {
        return null;
    }
    // Count commas to determine active parameter
    const afterFunctionName = beforeCursor.substring(beforeCursor.lastIndexOf(functionName) + functionName.length);
    const openParenIndex = afterFunctionName.indexOf('(');
    if (openParenIndex === -1) {
        return null;
    }
    const insideParens = afterFunctionName.substring(openParenIndex + 1);
    const commaCount = (insideParens.match(/,/g) || []).length;
    const activeParameter = Math.min(commaCount, func.parameters.length - 1);
    // Build parameter information
    const parameterInfos = func.parameters.map(param => ({
        label: `${param.type} ${param.name}${param.defaultValue ? ` = ${param.defaultValue}` : ''}`,
        documentation: param.description || `Parameter of type ${param.type}`
    }));
    const signature = {
        label: `${func.returnType} ${func.name}(${func.parameters.map(p => `${p.type} ${p.name}${p.defaultValue ? ` = ${p.defaultValue}` : ''}`).join(', ')})`,
        documentation: func.description || `Function returning ${func.returnType}`,
        parameters: parameterInfos
    };
    return {
        signatures: [signature],
        activeSignature: 0,
        activeParameter: activeParameter >= 0 ? activeParameter : 0
    };
});
// Make the text document manager listen on the connection
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map