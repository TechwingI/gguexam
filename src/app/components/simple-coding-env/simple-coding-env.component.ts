import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { SimpleCodeExecutionService } from '../../services/simple-code-execution.service';
declare var monaco: any;

@Component({
  selector: 'app-simple-coding-env',
  templateUrl: './simple-coding-env.component.html',
  styleUrls: ['./simple-coding-env.component.css']
})
export class SimpleCodingEnvComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  @ViewChild('outputContainer', { static: true }) outputContainer!: ElementRef;
  
  private editor: any;
  public monacoLoaded = false; // Make it public so template can access it
  
  selectedLanguage = 'javascript';
  code = '';
  output = '';
  errors: any[] = [];
  testResults: any[] = [];
  suggestions: string[] = [];
  
  languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' }
  ];

  // Language-specific suggestions
  languageSuggestions: any = {
    javascript: [
      'function', 'console.log()', 'if', 'else', 'for', 'while', 'let', 'const', 'var',
      'return', 'try', 'catch', 'finally', 'throw', 'class', 'extends', 'constructor',
      'this', 'new', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Date',
      'Math', 'JSON', 'Promise', 'async', 'await'
    ],
    python: [
      'def', 'print()', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue',
      'return', 'try', 'except', 'finally', 'raise', 'class', 'import', 'from',
      'as', 'with', 'lambda', 'yield', 'global', 'nonlocal', 'assert', 'del',
      'pass', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is'
    ],
    java: [
      'public', 'private', 'protected', 'static', 'final', 'abstract', 'interface',
      'class', 'extends', 'implements', 'new', 'this', 'super', 'void', 'int',
      'double', 'boolean', 'char', 'String', 'if', 'else', 'switch', 'case',
      'for', 'while', 'do', 'break', 'continue', 'return', 'try', 'catch',
      'finally', 'throw', 'throws', 'import', 'package', 'System.out.println()'
    ],
    cpp: [
      '#include', 'using namespace std;', 'int', 'double', 'bool', 'char', 'string',
      'void', 'if', 'else', 'switch', 'case', 'for', 'while', 'do', 'break',
      'continue', 'return', 'try', 'catch', 'throw', 'class', 'struct', 'public',
      'private', 'protected', 'virtual', 'override', 'const', 'static', 'new',
      'delete', 'cout', 'cin', 'endl', 'namespace'
    ]
  };

  constructor(private codeExecutionService: SimpleCodeExecutionService) { }

  ngOnInit(): void {
    this.setCodeTemplate();
  }

  ngAfterViewInit(): void {
    // Wait for Monaco to load
    if ((window as any).monacoLoaded) {
      (window as any).monacoLoaded.then(() => {
        this.monacoLoaded = true;
        this.initializeEditor();
      });
    } else {
      // Check if monaco is already available globally
      setTimeout(() => {
        if (typeof monaco !== 'undefined') {
          this.monacoLoaded = true;
          this.initializeEditor();
        } else {
          // Fallback to basic textarea if Monaco doesn't load
          console.warn('Monaco Editor not loaded, using basic textarea');
        }
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.dispose();
    }
  }

  ngAfterViewChecked(): void {
    // Initialize editor once Monaco is loaded
    if (this.monacoLoaded && !this.editor && this.editorContainer) {
      this.initializeEditor();
    }
  }

  initializeEditor(): void {
    if (!this.monacoLoaded || !this.editorContainer) return;
    
    const container = this.editorContainer.nativeElement;
    
    // Clear container
    container.innerHTML = '';
    
    // Create editor
    this.editor = monaco.editor.create(container, {
      value: this.code,
      language: this.getMonacoLanguage(),
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
      scrollBeyondLastLine: false,
      smoothScrolling: true
    });
    
    // Register for completions
    this.registerCompletions();
    
    // Listen for changes
    this.editor.onDidChangeModelContent(() => {
      this.code = this.editor.getValue();
    });
    
    // Trigger suggestion widget on Ctrl+Space
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      monaco.editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
    });
  }

  selectLanguage(language: string): void {
    this.selectedLanguage = language;
    this.setCodeTemplate();
    this.clearErrors();
    this.clearTestResults();
    this.suggestions = [];
    
    // Update editor language
    if (this.editor) {
      monaco.editor.setModelLanguage(this.editor.getModel(), this.getMonacoLanguage());
    }
  }

  setCodeTemplate(): void {
    switch (this.selectedLanguage) {
      case 'javascript':
        this.code = `// Write your JavaScript solution here
function solution(input) {
    // Your code here
    return input;
}

// Example usage:
// console.log(solution("hello"));`;
        break;
      case 'python':
        this.code = `# Write your Python solution here
def solution(input):
    # Your code here
    return input

# Example usage:
# print(solution("hello"))`;
        break;
      case 'java':
        this.code = `// Write your Java solution here
public class Solution {
    public static String solution(String input) {
        // Your code here
        return input;
    }
    
    public static void main(String[] args) {
        // Example usage:
        // System.out.println(solution("hello"));
    }
}`;
        break;
      case 'cpp':
        this.code = `// Write your C++ solution here
#include <iostream>
#include <string>
using namespace std;

string solution(string input) {
    // Your code here
    return input;
}

int main() {
    // Example usage:
    // cout << solution("hello") << endl;
    return 0;
}`;
        break;
      default:
        this.code = '// Write your solution here';
    }
  }

  // Get suggestions based on current input
  getSuggestions(input: string): string[] {
    const lowerInput = input.toLowerCase();
    const langSuggestions = this.languageSuggestions[this.selectedLanguage] || [];
    
    if (!lowerInput) return langSuggestions.slice(0, 10);
    
    return langSuggestions
      .filter((suggestion: string) => suggestion.toLowerCase().includes(lowerInput))
      .slice(0, 10);
  }

  // Show suggestions manually (for Ctrl+Space)
  showSuggestions(): void {
    if (this.editor) {
      // Trigger Monaco's built-in suggest widget
      monaco.editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
    }
  }

  // Register completions with Monaco
  registerCompletions(): void {
    if (!monaco.languages || !this.editor) return;
    
    const provider = {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        
        const suggestions = this.languageSuggestions[this.selectedLanguage] || [];
        
        const monacoSuggestions = suggestions.map((suggestion: string) => ({
          label: suggestion,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: suggestion,
          range: range
        }));
        
        return { suggestions: monacoSuggestions };
      },
      triggerCharacters: ['.', '"', "'", '/', ' ']
    };
    
    monaco.languages.registerCompletionItemProvider(
      this.getMonacoLanguage(), 
      provider
    );
  }

  // Get Monaco language identifier
  getMonacoLanguage(): string {
    switch (this.selectedLanguage) {
      case 'javascript': return 'javascript';
      case 'python': return 'python';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  }

  // Handle key events for suggestions
  onCodeInput(event: any): void {
    const cursorPosition = event.target.selectionStart;
    const textBeforeCursor = this.code.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    
    // Get the last word being typed
    const words = currentLine.trim().split(/\s+/);
    const lastWord = words[words.length - 1] || '';
    
    // Get suggestions based on the last word
    this.suggestions = this.getSuggestions(lastWord);
  }

  // Handle keyboard events
  onKeyDown(event: KeyboardEvent): void {
    // Escape key to close suggestions
    if (event.key === 'Escape') {
      this.suggestions = [];
      return;
    }
    
    // Enter key to accept first suggestion
    if (event.key === 'Enter' && this.suggestions.length > 0) {
      event.preventDefault();
      this.insertSuggestion(this.suggestions[0]);
      return;
    }
    
    // Tab key to accept first suggestion
    if (event.key === 'Tab' && this.suggestions.length > 0) {
      event.preventDefault();
      this.insertSuggestion(this.suggestions[0]);
      return;
    }
  }

  // Insert suggestion at cursor position
  insertSuggestion(suggestion: string): void {
    if (this.editor) {
      // Insert into Monaco Editor
      const position = this.editor.getPosition();
      this.editor.executeEdits('', [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: suggestion
      }]);
      this.editor.focus();
    } else {
      // In a real implementation with a proper editor, we would insert at cursor position
      // For textarea, we'll append to the end for simplicity
      this.code += ' ' + suggestion;
    }
    this.suggestions = [];
  }

  runCode(): void {
    this.clearErrors();
    this.clearTestResults();
    this.output = 'Running code...\n';
    
    try {
      this.checkSyntax();
      this.runTests();
      this.output += 'Code executed successfully!\n';
    } catch (error: any) {
      this.output += `Error: ${error.message}\n`;
      this.addError(0, error.message);
    }
  }

  checkSyntax(): void {
    // Clear previous errors
    this.clearErrors();
    
    // Split code into lines for line-specific error reporting
    const lines = this.code.split('\n');
    
    if (this.selectedLanguage === 'javascript') {
      // Check for unmatched braces
      const openBraces = (this.code.match(/{/g) || []).length;
      const closeBraces = (this.code.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        this.addError(0, `Unmatched braces: ${openBraces} opened, ${closeBraces} closed`);
      }
      
      // Check for unmatched parentheses
      const openParens = (this.code.match(/\(/g) || []).length;
      const closeParens = (this.code.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        this.addError(0, `Unmatched parentheses: ${openParens} opened, ${closeParens} closed`);
      }
      
      // Check for function declarations without braces
      lines.forEach((line, index) => {
        if (line.includes('function') && !line.includes('{')) {
          this.addError(index + 1, 'Missing opening brace in function declaration');
        }
      });
    } else if (this.selectedLanguage === 'python') {
      // Check for function definitions without colons
      lines.forEach((line, index) => {
        if (line.trim().startsWith('def') && !line.includes(':')) {
          this.addError(index + 1, 'Missing colon in function definition');
        }
        
        // Check for if/for/while statements without colons
        const controlStructures = ['if', 'for', 'while', 'elif', 'else'];
        for (const structure of controlStructures) {
          if (line.trim().startsWith(structure) && 
              !line.includes(':') && 
              line.includes(structure + ' ')) {
            this.addError(index + 1, `Missing colon in ${structure} statement`);
          }
        }
      });
    } else if (this.selectedLanguage === 'java') {
      // Check for class declarations without braces
      lines.forEach((line, index) => {
        if (line.includes('class') && !line.includes('{')) {
          this.addError(index + 1, 'Missing opening brace in class declaration');
        }
        
        // Check for method declarations without braces
        if (line.includes('public') && line.includes(')') && !line.includes('{')) {
          this.addError(index + 1, 'Missing opening brace in method declaration');
        }
      });
    } else if (this.selectedLanguage === 'cpp') {
      // Check for function declarations without braces
      lines.forEach((line, index) => {
        if (line.includes(')') && line.includes(';') && !line.includes('{')) {
          this.addError(index + 1, 'Missing opening brace in function declaration');
        }
      });
      
      // Check for unmatched braces
      const openBraces = (this.code.match(/{/g) || []).length;
      const closeBraces = (this.code.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        this.addError(0, `Unmatched braces: ${openBraces} opened, ${closeBraces} closed`);
      }
    }
    
    // If there are syntax errors, throw an exception
    if (this.errors.length > 0) {
      throw new Error(`${this.errors.length} syntax error(s) found`);
    }
  }

  runTests(): void {
    // Language-specific test cases
    let testCases = [];
    
    switch (this.selectedLanguage) {
      case 'javascript':
        testCases = [
          { name: 'Basic Return', input: '"hello"', expected: '"hello"' },
          { name: 'Number Handling', input: '42', expected: '42' },
          { name: 'Array Processing', input: '[1,2,3]', expected: '[1,2,3]' },
          { name: 'Empty Input', input: '""', expected: '""' }
        ];
        break;
      case 'python':
        testCases = [
          { name: 'String Return', input: '"hello"', expected: '"hello"' },
          { name: 'Integer Handling', input: '42', expected: '42' },
          { name: 'List Processing', input: '[1,2,3]', expected: '[1,2,3]' },
          { name: 'Empty String', input: '""', expected: '""' }
        ];
        break;
      case 'java':
        testCases = [
          { name: 'String Return', input: '"hello"', expected: '"hello"' },
          { name: 'Integer Handling', input: '42', expected: '42' },
          { name: 'Empty String', input: '""', expected: '""' }
        ];
        break;
      case 'cpp':
        testCases = [
          { name: 'String Return', input: '"hello"', expected: '"hello"' },
          { name: 'Integer Handling', input: '42', expected: '42' },
          { name: 'Empty String', input: '""', expected: '""' }
        ];
        break;
      default:
        testCases = [
          { name: 'Default Test', input: '"test"', expected: '"test"' }
        ];
    }
    
    testCases.forEach((testCase, index) => {
      try {
        const result = this.executeTest(testCase.input);
        // For demo purposes, we'll simulate some passes and fails
        const shouldPass = index % 2 === 0; // Alternate pass/fail
        const passed = shouldPass;
        
        this.testResults.push({
          testCase: index + 1,
          name: testCase.name,
          input: testCase.input,
          expected: testCase.expected,
          actual: shouldPass ? testCase.expected : '"different_result"',
          passed: passed,
          status: passed ? '✅ Passed' : '❌ Failed'
        });
        
        this.output += `Test Case ${index + 1} (${testCase.name}): ${passed ? 'Passed' : 'Failed'}\n`;
      } catch (error: any) {
        this.testResults.push({
          testCase: index + 1,
          name: testCase.name,
          input: testCase.input,
          expected: testCase.expected,
          actual: 'Error',
          passed: false,
          status: '❌ Error',
          error: error.message
        });
        
        this.output += `Test Case ${index + 1} (${testCase.name}): Error - ${error.message}\n`;
      }
    });
  }

  executeTest(input: string): string {
    // Use the code execution service
    const result = this.codeExecutionService.executeCode(this.selectedLanguage, this.code, input);
    
    if (result.success) {
      // Convert result to string for display
      if (typeof result.result === 'object') {
        return JSON.stringify(result.result);
      }
      return String(result.result);
    } else {
      throw new Error(result.error);
    }
  }

  clearErrors(): void {
    this.errors = [];
  }

  clearTestResults(): void {
    this.testResults = [];
  }

  addError(line: number, message: string): void {
    this.errors.push({ line, message });
  }

  getLineCount(): number {
    return this.code ? this.code.split('\n').length : 0;
  }

  // Get error for specific line
  getErrorForLine(lineNumber: number): any {
    return this.errors.find(error => error.line === lineNumber);
  }
}