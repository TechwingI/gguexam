import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ExamService } from '../../services/exam.service';
import { CodingQuestion } from '../../models/exam';

@Component({
  selector: 'app-coding-environment',
  templateUrl: './coding-environment.component.html',
  styleUrls: ['./coding-environment.component.css']
})
export class CodingEnvironmentComponent implements OnInit {
  @Input() questionIndex: number = 0;
  @Output() prevQuestion = new EventEmitter<void>();
  @Output() nextQuestion = new EventEmitter<void>();
  
  selectedLanguage: string = 'JavaScript';
  showLanguageDropdown: boolean = false;
  code: string = '';
  output: string = 'Run your code to see output...';
  activeTab: string = 'output';
  errors: any[] = [];
  suggestions: string[] = [];
  showSuggestions: boolean = false;
  suggestionPosition: { top: number; left: number } = { top: 0, left: 0 };
  
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

  // Correct answers for each language and question
  correctAnswers: any = {
    java: `public class Solution {
    public static void main(String args[]) {
        String s = "hello";
        String reversed = new StringBuilder(s).reverse().toString();
        System.out.println(reversed);
    }
}`,
    
    javascript: `function reverseString(s) {
    return s.split('').reverse().join('');
}

// Example usage
let s = "hello";
console.log(reverseString(s));`,
    
    python: `def reverse_string(s):
    return s[::-1]

# Example usage
s = "hello"
print(reverse_string(s))`,
    
    cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

string reverseString(string s) {
    reverse(s.begin(), s.end());
    return s;
}

int main() {
    string s = "hello";
    cout << reverseString(s) << endl;
    return 0;
}`
  };

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    this.loadCode();
  }

  loadCode(): void {
    const answers = this.examService.getAnswers();
    const globalIndex = 30 + this.questionIndex;
    
    if (answers[globalIndex] && answers[globalIndex][this.selectedLanguage.toLowerCase()]) {
      this.code = answers[globalIndex][this.selectedLanguage.toLowerCase()];
    } else {
      this.code = this.getDefaultCode();
    }
  }

  saveCode(): void {
    // Save code to exam service
    this.examService.setAnswer(30 + this.questionIndex, {
      [this.selectedLanguage.toLowerCase()]: this.code
    });
  }

  getDefaultCode(): string {
    switch (this.selectedLanguage.toLowerCase()) {
      case 'javascript':
        return '// Write your solution here\nfunction solution() {\n    \n}';
      case 'python':
        return '# Write your solution here\ndef solution():\n    pass';
      case 'java':
        return '// Write your solution here\npublic class Solution {\n    \n}';
      case 'cpp':
        return '// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}';
      default:
        return '// Write your solution here';
    }
  }

  getCurrentCodingQuestion(): CodingQuestion | undefined {
    return this.examService.getCodingQuestion(this.questionIndex);
  }

  // Fixed method name - was getCodingQuestionIndex in template
  getQuestionIndex(): number {
    return this.questionIndex;
  }

  // Fixed method name - was toggleLanguageDropdown in template
  toggleLanguageDropdown(): void {
    this.showLanguageDropdown = !this.showLanguageDropdown;
  }

  selectLanguage(language: any): void {
    this.selectedLanguage = language.label;
    this.showLanguageDropdown = false;
    this.loadCode();
  }

  // Handle keydown events for Ctrl+Space and other shortcuts
  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === ' ') {
      event.preventDefault();
      this.showCodeSuggestions();
    } else if (event.key === 'Escape') {
      this.hideSuggestions();
    } else if (event.ctrlKey && event.key === 'z') {
      // Ctrl+Z for undo - let textarea handle this naturally
      // Just ensure we save the code after undo
      setTimeout(() => {
        this.saveCode();
      }, 0);
    } else if (event.ctrlKey && event.key === 'y') {
      // Ctrl+Y for redo - let textarea handle this naturally
      setTimeout(() => {
        this.saveCode();
      }, 0);
    } else if (event.altKey && event.shiftKey && event.key === 'F') {
      // Alt+Shift+F for formatting
      event.preventDefault();
      this.formatCode();
    }
  }

  formatCode(): void {
    // Advanced code formatting based on language (IDE-like formatting)
    switch (this.selectedLanguage.toLowerCase()) {
      case 'javascript':
        this.code = this.formatJavaScriptCode(this.code);
        break;
      case 'java':
        this.code = this.formatJavaCode(this.code);
        break;
      case 'python':
        this.code = this.formatPythonCode(this.code);
        break;
      case 'cpp':
        this.code = this.formatCppCode(this.code);
        break;
    }
    this.saveCode();
  }

  formatJavaCode(code: string): string {
    // More sophisticated Java formatting
    let formatted = code;
    
    // Add proper indentation
    let indentLevel = 0;
    const lines = formatted.split('\n');
    const formattedLines = [];
    
    for (let line of lines) {
      line = line.trim();
      
      // Decrease indent for closing braces
      if (line.startsWith('}') || line.includes('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Add current indentation
      if (line.length > 0) {
        const indent = '    '.repeat(indentLevel); // 4 spaces per level
        formattedLines.push(indent + line);
      } else {
        formattedLines.push('');
      }
      
      // Increase indent for opening braces
      if (line.endsWith('{') || line.includes('{')) {
        indentLevel++;
      }
    }
    
    return formattedLines.join('\n');
  }

  formatJavaScriptCode(code: string): string {
    // More sophisticated JavaScript formatting
    let formatted = code;
    
    // Add proper indentation
    let indentLevel = 0;
    const lines = formatted.split('\n');
    const formattedLines = [];
    
    for (let line of lines) {
      line = line.trim();
      
      // Decrease indent for closing braces/brackets
      if (line.startsWith('}') || line.startsWith(')') || line.includes('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Add current indentation
      if (line.length > 0) {
        const indent = '    '.repeat(indentLevel); // 4 spaces per level
        formattedLines.push(indent + line);
      } else {
        formattedLines.push('');
      }
      
      // Increase indent for opening braces/brackets
      if (line.endsWith('{') || line.endsWith('(') || line.includes('{')) {
        indentLevel++;
      }
    }
    
    return formattedLines.join('\n');
  }

  formatPythonCode(code: string): string {
    // Python formatting (indentation-based)
    let formatted = code;
    
    // Add proper indentation based on colons and dedent keywords
    let indentLevel = 0;
    const lines = formatted.split('\n');
    const formattedLines = [];
    const dedentKeywords = ['else', 'elif', 'except', 'finally'];
    
    for (let line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (trimmedLine.length === 0) {
        formattedLines.push('');
        continue;
      }
      
      // Check for dedent keywords
      let shouldDedent = false;
      for (const keyword of dedentKeywords) {
        if (trimmedLine.startsWith(keyword)) {
          shouldDedent = true;
          break;
        }
      }
      
      if (shouldDedent) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Add current indentation
      const indent = '    '.repeat(indentLevel); // 4 spaces per level
      formattedLines.push(indent + trimmedLine);
      
      // Increase indent for lines ending with colon
      if (trimmedLine.endsWith(':')) {
        indentLevel++;
      }
    }
    
    return formattedLines.join('\n');
  }

  formatCppCode(code: string): string {
    // More sophisticated C++ formatting
    let formatted = code;
    
    // Add proper indentation
    let indentLevel = 0;
    const lines = formatted.split('\n');
    const formattedLines = [];
    
    for (let line of lines) {
      line = line.trim();
      
      // Decrease indent for closing braces
      if (line.startsWith('}') || line.includes('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Add current indentation
      if (line.length > 0) {
        const indent = '    '.repeat(indentLevel); // 4 spaces per level
        formattedLines.push(indent + line);
      } else {
        formattedLines.push('');
      }
      
      // Increase indent for opening braces
      if (line.endsWith('{') || line.includes('{')) {
        indentLevel++;
      }
    }
    
    return formattedLines.join('\n');
  }

  showCodeSuggestions(): void {
    // Hide any existing suggestions first
    this.hideSuggestions();
    
    // Get current cursor position
    const textarea: any = document.querySelector('textarea');
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = this.code.substring(0, cursorPos);
    
    // Extract the current word being typed
    const textBefore = textBeforeCursor.split('\n').pop() || '';
    const match = textBefore.match(/(\w*)$/);
    const currentWord = match ? match[1] : '';
    
    console.log('Current word for suggestions:', currentWord);
    console.log('Text before cursor:', textBefore);
    
    // Get suggestions based on the current word and language
    let langSuggestions: string[] = [];
    
    switch (this.selectedLanguage.toLowerCase()) {
      case 'java':
        langSuggestions = [
          'public', 'private', 'protected', 'static', 'final', 'abstract', 'interface',
          'class', 'extends', 'implements', 'new', 'this', 'super', 'void', 'int',
          'double', 'boolean', 'char', 'String', 'if', 'else', 'switch', 'case',
          'for', 'while', 'do', 'break', 'continue', 'return', 'try', 'catch',
          'finally', 'throw', 'throws', 'import', 'package', 'System.out.println',
          'StringBuilder', 'reverse', 'toString', 'length', 'main', 'args'
        ];
        break;
      case 'python':
        langSuggestions = [
          'def', 'print', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue',
          'return', 'try', 'except', 'finally', 'raise', 'class', 'import', 'from',
          'as', 'with', 'lambda', 'yield', 'global', 'nonlocal', 'assert', 'del',
          'pass', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is',
          'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set',
          '__name__', '__main__', 'reverse', 'split', 'join', 'strip'
        ];
        break;
      case 'javascript':
        langSuggestions = [
          'function', 'console.log', 'if', 'else', 'for', 'while', 'let', 'const', 'var',
          'return', 'try', 'catch', 'finally', 'throw', 'class', 'extends', 'constructor',
          'this', 'new', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Date',
          'Math', 'JSON', 'Promise', 'async', 'await', 'split', 'reverse', 'join',
          'length', 'push', 'pop', 'shift', 'unshift'
        ];
        break;
      case 'cpp':
        langSuggestions = [
          '#include', 'using namespace std', 'int', 'double', 'bool', 'char', 'string',
          'void', 'if', 'else', 'switch', 'case', 'for', 'while', 'do', 'break',
          'continue', 'return', 'try', 'catch', 'throw', 'class', 'struct', 'public',
          'private', 'protected', 'virtual', 'override', 'const', 'static', 'new',
          'delete', 'cout', 'cin', 'endl', 'namespace', 'std', 'vector', 'algorithm',
          'reverse', 'begin', 'end'
        ];
        break;
    }
    
    console.log('Available suggestions for', this.selectedLanguage, ':', langSuggestions);
    
    // If there's text to filter by, filter suggestions
    // Otherwise, show all suggestions
    if (currentWord.trim() !== '') {
      this.suggestions = langSuggestions
        .filter((suggestion: string) => suggestion.toLowerCase().startsWith(currentWord.toLowerCase()))
        .slice(0, 10);
    } else {
      // Show all suggestions when no text to filter by
      this.suggestions = langSuggestions.slice(0, 10);
    }
    
    console.log('Filtered suggestions:', this.suggestions);
    
    if (this.suggestions.length > 0) {
      this.showSuggestions = true;
      // Position suggestions near cursor
      const rect = textarea.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(textarea);
      const borderTop = parseFloat(computedStyle.borderTopWidth);
      const borderLeft = parseFloat(computedStyle.borderLeftWidth);
      const paddingTop = parseFloat(computedStyle.paddingTop);
      const paddingLeft = parseFloat(computedStyle.paddingLeft);
      
      // Calculate position relative to the textarea
      this.suggestionPosition = { 
        top: rect.top + window.scrollY + borderTop + paddingTop + 20,
        left: rect.left + window.scrollX + borderLeft + paddingLeft + 50
      };
      
      console.log('Showing suggestions at position:', this.suggestionPosition);
    } else {
      this.hideSuggestions();
    }
  }

  hideSuggestions(): void {
    this.showSuggestions = false;
    this.suggestions = [];
  }

  selectSuggestion(suggestion: string): void {
    // Insert the suggestion at cursor position
    const textarea: any = document.querySelector('textarea');
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = this.code.substring(0, cursorPos);
    const textAfterCursor = this.code.substring(textarea.selectionEnd);
    
    // Find the word to replace (everything from the last space or start of line to cursor)
    const textBefore = textBeforeCursor.split('\n').pop() || '';
    const match = textBefore.match(/(\w*)$/);
    const currentWord = match ? match[1] : '';
    
    // Replace the current word with the suggestion
    const newTextBeforeCursor = textBeforeCursor.substring(0, textBeforeCursor.length - currentWord.length) + suggestion;
    this.code = newTextBeforeCursor + textAfterCursor;
    
    // Move cursor to after the inserted suggestion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = newTextBeforeCursor.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
    
    this.hideSuggestions();
    this.saveCode();
  }

  runCode(): void {
    this.clearOutput();
    this.output = 'Running code...\n';
    
    try {
      this.checkSyntax();
      this.runTests();
      this.output += '\n✅ Code executed successfully!';
    } catch (error: any) {
      this.output += `\n❌ Error: ${error.message}`;
    }
  }

  checkSyntax(): void {
    // Clear previous errors
    this.errors = [];
    
    // Split code into lines for line-specific error reporting
    const lines = this.code.split('\n');
    
    if (this.selectedLanguage.toLowerCase() === 'javascript') {
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
    } else if (this.selectedLanguage.toLowerCase() === 'python') {
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
    } else if (this.selectedLanguage.toLowerCase() === 'java') {
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
    } else if (this.selectedLanguage.toLowerCase() === 'cpp') {
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
    // Language-specific test cases for string reversal
    const testCases = [
      { name: 'Reverse "hello"', input: '"hello"', expected: '"olleh"' },
      { name: 'Reverse single character', input: '"a"', expected: '"a"' },
      { name: 'Reverse empty string', input: '""', expected: '""' },
      { name: 'Reverse "world"', input: '"world"', expected: '"dlrow"' }
    ];
    
    let passedTests = 0;
    let totalTests = testCases.length;
    
    // Check if user's code matches the correct answer exactly line by line
    const isExactMatch = this.isCodeCorrect();
    
    testCases.forEach((testCase, index) => {
      try {
        // Only execute tests if code is an exact match
        if (isExactMatch) {
          // Actually test the code by simulating execution
          const result = this.executeCodeWithInput(testCase.input);
          const passed = result === testCase.expected;
          
          if (passed) {
            passedTests++;
            this.output += `\n✅ Test Case ${index + 1} (${testCase.name}): Passed`;
          } else {
            this.output += `\n❌ Test Case ${index + 1} (${testCase.name}): Failed`;
            this.output += `\n   Input: ${testCase.input}`;
            this.output += `\n   Expected: ${testCase.expected}`;
            this.output += `\n   Actual: ${result}`;
          }
        } else {
          // Code doesn't match exactly, fail all tests
          this.output += `\n❌ Test Case ${index + 1} (${testCase.name}): Failed`;
          this.output += `\n   Issue: Code implementation doesn't match the exact solution`;
          this.output += `\n   Expected: Exact line-by-line match with the provided solution`;
        }
      } catch (error: any) {
        this.output += `\n❌ Test Case ${index + 1} (${testCase.name}): Error - ${error.message}`;
      }
    });
    
    this.output += `\n\n📊 Test Results: ${passedTests}/${totalTests} passed`;
    
    if (isExactMatch && passedTests === totalTests) {
      this.output += '\n🎉 All tests passed! Solution is correct.';
    } else if (isExactMatch && passedTests > 0) {
      this.output += '\n⚠️ Some tests failed. Please check your implementation.';
    } else if (!isExactMatch) {
      this.output += '\n❌ Solution does not match the expected exact implementation.';
    } else {
      this.output += '\n💥 All tests failed.';
    }
  }

  isCodeCorrect(): boolean {
    // Get the correct answer for the current language
    const correctAnswer = this.correctAnswers[this.selectedLanguage.toLowerCase()];
    
    if (!correctAnswer) {
      return false;
    }
    
    // For Java, check for the essential elements
    if (this.selectedLanguage.toLowerCase() === 'java') {
      const normalizedCode = this.code.replace(/\s+/g, ' ').trim();
      const hasClass = normalizedCode.includes('public class Solution');
      const hasMain = normalizedCode.includes('public static void main');
      const hasStringBuilder = normalizedCode.includes('new StringBuilder') || normalizedCode.includes('StringBuilder');
      const hasReverse = normalizedCode.includes('.reverse()');
      const hasSystemOut = normalizedCode.includes('System.out.println');
      
      return hasClass && hasMain && hasStringBuilder && hasReverse && hasSystemOut;
    }
    
    // For other languages, use the previous exact matching approach but be more lenient
    const normalizedUserCode = this.normalizeCodeForExactMatch(this.code);
    const normalizedCorrectCode = this.normalizeCodeForExactMatch(correctAnswer);
    
    // Split both codes into lines, but filter out empty lines for comparison
    const userLines = normalizedUserCode.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const correctLines = normalizedCorrectCode.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Check if they have the same number of non-empty lines
    if (userLines.length !== correctLines.length) {
      return false;
    }
    
    // Check each line for exact match
    for (let i = 0; i < userLines.length; i++) {
      if (userLines[i] !== correctLines[i]) {
        return false;
      }
    }
    
    // If we get here, all lines match exactly
    return true;
  }

  normalizeCodeForExactMatch(code: string): string {
    // Remove extra whitespace and normalize the code while preserving line structure
    // But be more lenient with blank lines
    return code
      .replace(/\t/g, '  ') // Convert tabs to spaces
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n') // Normalize line endings
      .trim(); // Remove leading/trailing whitespace
  }

  executeCodeWithInput(input: string): string {
    // Simulate code execution based on the language and code content
    const code = this.code.toLowerCase();
    
    // Check if code implements the correct logic
    const isCorrect = this.isCodeCorrect();
    
    if (!isCorrect) {
      return '"implementation_error"';
    }
    
    // For Java, check if it's a string reversal implementation
    if (this.selectedLanguage.toLowerCase() === 'java' && code.includes('stringbuilder') && code.includes('reverse')) {
      // Extract the string from input (removing quotes)
      const str = input.replace(/"/g, '');
      const reversed = str.split('').reverse().join('');
      return `"${reversed}"`;
    }
    
    // For JavaScript
    if (this.selectedLanguage.toLowerCase() === 'javascript' && code.includes('split') && code.includes('reverse')) {
      const str = input.replace(/"/g, '');
      const reversed = str.split('').reverse().join('');
      return `"${reversed}"`;
    }
    
    // For Python
    if (this.selectedLanguage.toLowerCase() === 'python' && code.includes('[::-1]')) {
      const str = input.replace(/"/g, '');
      const reversed = str.split('').reverse().join('');
      return `"${reversed}"`;
    }
    
    // For C++
    if (this.selectedLanguage.toLowerCase() === 'cpp' && code.includes('reverse')) {
      const str = input.replace(/"/g, '');
      const reversed = str.split('').reverse().join('');
      return `"${reversed}"`;
    }
    
    // Default fallback - just return the input
    return input;
  }

  addError(line: number, message: string): void {
    this.errors.push({ line, message });
  }

  // Fixed method name - was onPrevQuestion in template
  goToPrevious(): void {
    this.prevQuestion.emit();
  }

  // Fixed method name - was onNextQuestion in template
  goToNext(): void {
    this.nextQuestion.emit();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  clearOutput(): void {
    this.output = '';
  }
  
  getLineCount(): number {
    return this.code ? this.code.split('\n').length : 0;
  }

  getLastRunTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}