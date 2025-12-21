// src/app/services/code-execution.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CodeExecutionService {
  
  executeJavaScript(code: string, testCases: any[]): any[] {
    const results = [];
    
    try {
      // Create an iframe for sandboxed execution
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      const iframeWindow = iframe.contentWindow as any;
      
      // Wrap user code in a safe context
      const safeCode = `
        ${code}
        
        // Test runner wrapper
        window.__testRunner = function(input) {
          try {
            // Parse input if it's array/object string
            let parsedInput = input;
            if (typeof input === 'string' && (input.startsWith('[') || input.startsWith('{'))) {
              try {
                parsedInput = JSON.parse(input);
              } catch (e) {
                // If not valid JSON, use as string
                parsedInput = input;
              }
            }
            
            // Find all functions in the current scope
            const functionNames = Object.keys(window).filter(key => 
              typeof window[key] === 'function' && 
              key !== '__testRunner' && 
              !key.startsWith('__') &&
              key !== 'eval' &&
              key !== 'Function'
            );
            
            // Try to call the first function found (usually the main solution function)
            if (functionNames.length > 0) {
              const funcName = functionNames[0];
              return window[funcName](parsedInput);
            }
            
            // Fallback: try common function names
            const commonNames = ['findMax', 'findMin', 'isPalindrome', 'reverseString', 'reverse', 'factorial', 'solve', 'solution'];
            for (const name of commonNames) {
              if (typeof window[name] === 'function') {
                return window[name](parsedInput);
              }
            }
            
            // Last resort: try to execute input directly
            return parsedInput;
          } catch (err) {
            return { error: (err as Error).message };
          }
        };
      `;
      
      // Execute the code in the iframe
      try {
        iframeWindow.eval(safeCode);
        
        // Run test cases
        testCases.forEach((testCase, index) => {
          try {
            const result = iframeWindow.__testRunner(testCase.input);
            
            // Compare result with expected
            const expected = testCase.expected;
            let passed = false;
            
            if (typeof result === 'boolean') {
              passed = result.toString() === expected.toLowerCase();
            } else if (typeof result === 'number') {
              passed = result.toString() === expected;
            } else {
              passed = String(result) === expected;
            }
            
            results.push({
              testCase: index + 1,
              input: testCase.input,
              expected: expected,
              actual: result,
              passed: passed,
              status: passed ? '✅ Passed' : '❌ Failed'
            });
          } catch (err) {
            const error = err as Error;
            results.push({
              testCase: index + 1,
              input: testCase.input,
              expected: testCase.expected,
              actual: 'Error: ' + error.message,
              passed: false,
              status: '⚠️ Error'
            });
          }
        });
        
      } catch (err) {
        const error = err as Error;
        results.push({
          error: 'Code execution failed: ' + error.message,
          status: '❌ Execution Error'
        });
      } finally {
        // Clean up iframe
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }
      
    } catch (err) {
      const error = err as Error;
      console.error('Code execution error:', error);
      results.push({
        error: 'System error: ' + error.message,
        status: '❌ System Error'
      });
    }
    
    return results;
  }
  
  executePython(code: string, testCases: any[]): any[] {
    const results = [];
    
    try {
      // Extract Python function and convert to JavaScript
      const jsCode = this.pythonToJavaScript(code);
      return this.executeJavaScript(jsCode, testCases);
    } catch (err) {
      const error = err as Error;
      return testCases.map((testCase, index) => ({
        testCase: index + 1,
        input: testCase.input,
        expected: testCase.expected,
        actual: 'Error: ' + error.message,
        passed: false,
        status: '❌ Error',
        error: error.message
      }));
    }
  }
  
  executeJava(code: string, testCases: any[]): any[] {
    const results = [];
    
    try {
      // Extract Java function and convert to JavaScript
      const jsCode = this.javaToJavaScript(code);
      return this.executeJavaScript(jsCode, testCases);
    } catch (err) {
      const error = err as Error;
      return testCases.map((testCase, index) => ({
        testCase: index + 1,
        input: testCase.input,
        expected: testCase.expected,
        actual: 'Error: ' + error.message,
        passed: false,
        status: '❌ Error',
        error: error.message
      }));
    }
  }
  
  executeCpp(code: string, testCases: any[]): any[] {
    const results = [];
    
    try {
      // Extract C++ function and convert to JavaScript
      const jsCode = this.cppToJavaScript(code);
      return this.executeJavaScript(jsCode, testCases);
    } catch (err) {
      const error = err as Error;
      return testCases.map((testCase, index) => ({
        testCase: index + 1,
        input: testCase.input,
        expected: testCase.expected,
        actual: 'Error: ' + error.message,
        passed: false,
        status: '❌ Error',
        error: error.message
      }));
    }
  }

  private pythonToJavaScript(pythonCode: string): string {
    // Extract function definition
    const funcMatch = pythonCode.match(/def\s+(\w+)\s*\(([^)]*)\)\s*:/);
    if (!funcMatch) {
      throw new Error('Python function definition not found. Please define a function using: def functionName(params):');
    }
    
    const funcName = funcMatch[1];
    const params = funcMatch[2].trim();
    
    // Extract function body (everything after def until next def/class or end)
    const lines = pythonCode.split('\n');
    let inFunction = false;
    let functionBody: string[] = [];
    let baseIndent = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (line.includes(`def ${funcName}`)) {
        inFunction = true;
        baseIndent = (line.match(/^(\s*)/)?.[1] || '').length;
        continue;
      }
      
      if (inFunction) {
        const currentIndent = (line.match(/^(\s*)/)?.[1] || '').length;
        
        // Stop if we hit another function/class at same or less indent
        if (trimmed && currentIndent <= baseIndent && (trimmed.startsWith('def ') || trimmed.startsWith('class '))) {
          break;
        }
        
        if (trimmed) {
          functionBody.push(this.convertPythonLineToJS(line, baseIndent));
        }
      }
    }
    
    if (functionBody.length === 0) {
      throw new Error('Python function body is empty');
    }
    
    // Convert Python to JavaScript
    let jsBody = functionBody.join('\n');
    
    return `function ${funcName}(${params || 'nums'}) {\n${jsBody}\n}`;
  }

  private convertPythonLineToJS(line: string, baseIndent: number = 0): string {
    let jsLine = line;
    
    // Remove base indentation
    const indent = (line.match(/^(\s*)/)?.[1] || '').length;
    const content = line.substring(indent);
    
    // Convert Python syntax to JavaScript
    let converted = content
      .replace(/print\s*\(/g, 'console.log(')
      .replace(/\bfor\s+(\w+)\s+in\s+(\w+):/g, 'for (let $1 of $2) {')
      .replace(/\bfor\s+(\w+)\s+in\s+range\s*\(([^)]+)\):/g, 'for (let $1 = 0; $1 < $2; $1++) {')
      .replace(/\bif\s+(.+):/g, 'if ($1) {')
      .replace(/\belif\s+(.+):/g, '} else if ($1) {')
      .replace(/\belse:/g, '} else {')
      .replace(/\blen\s*\((\w+)\)/g, '$1.length')
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      .replace(/\bnot\s+/g, '!')
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||');
    
    // Add proper indentation
    const jsIndent = '    '.repeat(Math.max(0, indent - baseIndent));
    return jsIndent + converted;
  }

  private javaToJavaScript(javaCode: string): string {
    // Extract method from Java class - look for public static method
    const methodMatch = javaCode.match(/public\s+static\s+\w+\s+(\w+)\s*\([^)]*\)\s*\{/);
    if (!methodMatch) {
      throw new Error('Java method definition not found. Please use: public static int methodName(int[] nums) { ... }');
    }
    
    const methodName = methodMatch[1];
    
    // Extract method body by tracking braces
    let braceCount = 0;
    let inMethod = false;
    let methodBody: string[] = [];
    const lines = javaCode.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(`public static`) && line.includes(methodName)) {
        inMethod = true;
        braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        continue;
      }
      
      if (inMethod) {
        braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        if (line.trim() && !line.includes('public class') && !line.includes('public class Solution')) {
          methodBody.push(this.convertJavaLineToJS(line));
        }
        if (braceCount <= 0) {
          break;
        }
      }
    }
    
    if (methodBody.length === 0) {
      throw new Error('Java method body is empty');
    }
    
    // Convert Java to JavaScript
    let jsBody = methodBody.join('\n');
    
    return `function ${methodName}(nums) {\n${jsBody}\n}`;
  }

  private convertJavaLineToJS(line: string): string {
    let jsLine = line.trim();
    
    // Convert Java syntax to JavaScript
    jsLine = jsLine
      .replace(/\bint\[\]\s+/g, '')
      .replace(/\bint\s+/g, 'let ')
      .replace(/\bString\[\]\s+/g, '')
      .replace(/\bString\s+/g, 'let ')
      .replace(/\bboolean\s+/g, 'let ')
      .replace(/\.length\b/g, '.length')
      .replace(/\bSystem\.out\.println\s*\(/g, 'console.log(')
      .replace(/\bSystem\.out\.print\s*\(/g, 'console.log(');
    
    return jsLine;
  }

  private cppToJavaScript(cppCode: string): string {
    // Extract function from C++ - look for return type function name pattern
    const funcMatch = cppCode.match(/(?:int|string|bool|void)\s+(\w+)\s*\([^)]*\)\s*\{/);
    if (!funcMatch) {
      throw new Error('C++ function definition not found. Please use: int functionName(vector<int> nums) { ... }');
    }
    
    const funcName = funcMatch[1];
    
    // Extract function body by tracking braces
    let braceCount = 0;
    let inFunction = false;
    let functionBody: string[] = [];
    const lines = cppCode.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(funcName) && line.includes('(') && line.includes('{')) {
        inFunction = true;
        braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        continue;
      }
      
      if (inFunction) {
        braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        if (line.trim() && !line.includes('#include') && !line.includes('using namespace')) {
          functionBody.push(this.convertCppLineToJS(line));
        }
        if (braceCount <= 0) {
          break;
        }
      }
    }
    
    if (functionBody.length === 0) {
      throw new Error('C++ function body is empty');
    }
    
    // Convert C++ to JavaScript
    let jsBody = functionBody.join('\n');
    
    return `function ${funcName}(nums) {\n${jsBody}\n}`;
  }

  private convertCppLineToJS(line: string): string {
    let jsLine = line.trim();
    
    // Convert C++ syntax to JavaScript
    jsLine = jsLine
      .replace(/\bint\s+/g, 'let ')
      .replace(/\bstring\s+/g, 'let ')
      .replace(/\bbool\s+/g, 'let ')
      .replace(/\.size\s*\(\)/g, '.length')
      .replace(/cout\s*<<\s*/g, 'console.log(')
      .replace(/endl/g, '')
      .replace(/<<\s*/g, ', ');
    
    return jsLine;
  }
}