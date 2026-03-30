import fs from 'fs';
import path from 'path';

const keywords = new Set([
    'true', 'false', 'null', 'undefined', 'typeof', 'instanceof', 'in', 'new', 'this', 
    'Math', 'Date', 'JSON', 'window', 'document', 'console', 'Object', 'Array', 'String', 
    'Number', 'Boolean'
]);

/**
 * Extracts all context dependencies from an HTML template.
 */
function extractContextKeys(html) {
    const keys = new Set();
    
    // 1. Extract this.property from <? ... ?> blocks WITHOUT removing them
    const jsBlockRegex = /<\?([\s\S]*?)\?>/g;
    let jsMatch;
    while ((jsMatch = jsBlockRegex.exec(html)) !== null) {
        const thisRegex = /\bthis\.([a-zA-Z_$][0-9a-zA-Z_$]*)\b/g;
        let pMatch;
        while ((pMatch = thisRegex.exec(jsMatch[1])) !== null) {
            keys.add(pMatch[1]);
        }
    }
    
    // 2. Continues to process the full HTML to ensure nested <{ ... }> are scanned
    let processedHtml = html;
    
    // 2. Find {{ ... }} patterns in the remaining HTML
    const curlyRegex = /\{\{([\s\S]*?)\}\}/g;
    let curlyMatch;
    while ((curlyMatch = curlyRegex.exec(processedHtml)) !== null) {
        let expr = curlyMatch[1];
        // Strip string literals to avoid false identifiers
        expr = expr.replace(/(['"`])[\s\S]*?\1/g, '');
        // Extract valid identifiers (not preceded by . or ? and not followed by :)
        const identRegex = /(?<![\.?a-zA-Z0-9_$])([a-zA-Z_$][0-9a-zA-Z_$]*)\b(?!\s*:)(?!\s*\()/g;
        let idMatch;
        while ((idMatch = identRegex.exec(expr)) !== null) {
            const id = idMatch[1];
            if (!keywords.has(id)) {
                keys.add(id);
            }
        }
    }
    
    // 3. Find #event="handlerName"
    const hashRegex = /#[a-zA-Z0-9_\-]+\s*=\s*(['"]?)([a-zA-Z_$][0-9a-zA-Z_$]*)\1/g;
    let hashMatch;
    while ((hashMatch = hashRegex.exec(processedHtml)) !== null) {
        const handlerName = hashMatch[2];
        if (!keywords.has(handlerName)) {
            keys.add(handlerName);
        }
    }
    
    // 4. Find @components
    const compRegex = /@([a-zA-Z_$][0-9a-zA-Z_$]*)/g;
    let compMatch;
    while ((compMatch = compRegex.exec(processedHtml)) !== null) {
        keys.add(compMatch[1]);
    }
    
    return Array.from(keys);
}

function extractStringLiteral(code, startIndex) {
    let i = startIndex;
    while (i < code.length && /\s/.test(code[i])) i++;
    
    const quote = code[i];
    if (quote !== "'" && quote !== '"' && quote !== '`') return null;
    
    let str = '';
    let isEscaped = false;
    i++; // Skip opening quote
    const contentStart = i;
    
    while (i < code.length) {
        if (isEscaped) {
            str += code[i];
            isEscaped = false;
        } else if (code[i] === '\\') {
            isEscaped = true;
        } else if (code[i] === quote) {
            break;
        } else {
            str += code[i];
        }
        i++;
    }
    
    return {
        value: str,
        quote: quote,
        start: startIndex,  
        contentStart: contentStart,
        end: i + 1          
    };
}

function parseUseTemplateArguments(code, startIndex) {
    const firstArg = extractStringLiteral(code, startIndex);
    if (!firstArg) return null;
    
    let i = firstArg.end;
    while (i < code.length && /\s/.test(code[i])) i++;
    
    const hasSecondArg = (code[i] === ',');
    
    let parensCount = 1; 
    let inStringQuote = null;
    let isEscaped = false;
    
    let closingParenIdx = -1;
    let j = i;
    while (j < code.length) {
        const char = code[j];
        if (isEscaped) {
            isEscaped = false;
        } else if (char === '\\') {
            isEscaped = true;
        } else if (inStringQuote) {
            if (char === inStringQuote) inStringQuote = null;
        } else if (char === "'" || char === '"' || char === '`') {
            inStringQuote = char;
        } else if (char === '(') {
            parensCount++;
        } else if (char === ')') {
            parensCount--;
            if (parensCount === 0) {
                closingParenIdx = j;
                break;
            }
        }
        j++;
    }
    
    return {
        firstArg,
        hasSecondArg,
        endIndex: closingParenIdx + 1
    };
}

/**
 * Transforms a JS file content to in-line HTML templates and auto-generate context.
 */
export async function transformJSFile(code, filePath) {
    const useTemplateRegex = /\buseTemplate\s*\(/g;
    let matches = [];
    let match;
    
    while ((match = useTemplateRegex.exec(code)) !== null) {
        const argStart = useTemplateRegex.lastIndex;
        const parsed = parseUseTemplateArguments(code, argStart);
        if (parsed) {
            matches.push({
                fullStart: match.index,
                argStart: argStart,
                ...parsed
            });
            useTemplateRegex.lastIndex = parsed.endIndex;
        }
    }
    
    if (matches.length === 0) return code;
    
    let offset = 0;
    let result = code;
    
    for (const m of matches) {
        let templateContent = m.firstArg.value;
        let isPath = templateContent.endsWith('.html') && !templateContent.includes('\n');
        
        let newHtml = templateContent;
        if (isPath) {
            const htmlPath = path.resolve(path.dirname(filePath), templateContent);
            if (fs.existsSync(htmlPath)) {
                newHtml = await fs.promises.readFile(htmlPath, 'utf8');
            } else {
                console.warn(`\n[Dev Server Warning] HTML Template not found: ${htmlPath}`);
            }
        }
        
        let generatedContextStr = '';
        if (!m.hasSecondArg) {
            const contextKeys = extractContextKeys(newHtml);
            if (contextKeys.length > 0) {
                generatedContextStr = `, { ${contextKeys.join(', ')} }`;
            } else {
                generatedContextStr = `, {}`;
            }
        }
        
        // Ensure no breaking syntax characters in the injected HTML (if it came from file)
        const escapedHtml = newHtml.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
        const originalArgRaw = code.substring(m.firstArg.contentStart - 1, m.firstArg.end);
        
        const replacementArg = isPath ? `\`${escapedHtml}\`` : originalArgRaw;
        
        const middleContent = result.substring(m.firstArg.end + offset, m.endIndex - 1 + offset); 
        
        const replacement = `useTemplate(${replacementArg}${middleContent}${generatedContextStr})`;
        
        const originalLength = m.endIndex - m.fullStart;
        result = result.substring(0, m.fullStart + offset) + replacement + result.substring(m.endIndex + offset);
        
        offset += replacement.length - originalLength;
    }
    
    return result;
}
