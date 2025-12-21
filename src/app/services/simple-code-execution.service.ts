import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SimpleCodeExecutionService {
  
  executeJavaScript(code: string, input: string): any {
    try {
      // Create a safe execution context
      const wrappedCode = `
        (function() {
          try {
            // Parse input if it looks like JSON
            let parsedInput;
            try {
              parsedInput = JSON.parse(${JSON.stringify(input)});
            } catch {
              parsedInput = ${JSON.stringify(input)};
            }
            
            // Execute user code in a controlled environment
            ${code}
            
            // Try to find and execute the main function
            const globalVars = Object.keys(this);
            const functionNames = globalVars.filter(key => 
              typeof this[key] === 'function' && 
              key !== 'eval' && 
              key !== 'Function'
            );
            
            if (functionNames.length > 0) {
              const result = this[functionNames[0]](parsedInput);
              return { success: true, result: result };
            }
            
            return { success: true, result: parsedInput };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })();
      `;
      
      // In a real implementation, this would use a secure sandbox
      // For demo purposes, we'll simulate execution
      return { success: true, result: input };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  executePython(code: string, input: string): any {
    // Simulate Python execution
    try {
      // In a real implementation, this would interface with a Python interpreter
      // For demo purposes, we'll simulate execution
      return { success: true, result: input };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  executeJava(code: string, input: string): any {
    // Simulate Java execution
    try {
      // In a real implementation, this would compile and run Java code
      // For demo purposes, we'll simulate execution
      return { success: true, result: input };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  executeCpp(code: string, input: string): any {
    // Simulate C++ execution
    try {
      // In a real implementation, this would compile and run C++ code
      // For demo purposes, we'll simulate execution
      return { success: true, result: input };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  executeCode(language: string, code: string, input: string): any {
    switch (language) {
      case 'javascript':
        return this.executeJavaScript(code, input);
      case 'python':
        return this.executePython(code, input);
      case 'java':
        return this.executeJava(code, input);
      case 'cpp':
        return this.executeCpp(code, input);
      default:
        return { success: false, error: `Unsupported language: ${language}` };
    }
  }
}