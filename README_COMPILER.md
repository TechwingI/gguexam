# Simple Code Compiler

A lightweight, browser-based code compiler with real-time suggestions, error detection, and test case execution.

## Features

- **Multi-language Support**: Write code in JavaScript, Python, Java, or C++
- **Intelligent Suggestions**: Get contextual code suggestions as you type
- **Real-time Error Detection**: Identify syntax errors with line-by-line highlighting
- **Test Case Execution**: Run your code against multiple test cases
- **No Backend Required**: Everything runs directly in your browser
- **Clean Interface**: Distraction-free coding environment

## How to Use

1. **Navigate to the Compiler**: Visit `/compiler` route or click "Try the Compiler Now" on the demo page
2. **Select Language**: Choose from JavaScript, Python, Java, or C++
3. **Write Code**: Use the editor to write your solution
4. **Get Suggestions**: As you type, you'll see contextual suggestions
5. **Run Code**: Click "Run Code" to execute your solution
6. **View Results**: See console output, errors, and test case results

## Technical Implementation

The compiler consists of:

- `SimpleCodingEnvComponent`: Main UI component with editor and results panels
- `SimpleCodeExecutionService`: Service for simulating code execution
- `CompilerDemoComponent`: Landing page showcasing features

## Key Capabilities

### Code Suggestions
- Language-specific suggestions appear as you type
- Press Tab or Enter to accept suggestions
- Press Escape to dismiss suggestions

### Error Detection
- Real-time syntax checking for all supported languages
- Line-specific error highlighting
- Detailed error messages

### Test Case Execution
- Language-appropriate test cases
- Pass/fail indicators for each test
- Detailed input/output comparison

## Supported Languages

1. **JavaScript**
   - Function templates
   - Control structure suggestions
   - Syntax validation

2. **Python**
   - Function definition templates
   - Indentation-aware suggestions
   - Syntax validation

3. **Java**
   - Class and method templates
   - Access modifier suggestions
   - Syntax validation

4. **C++**
   - Include statement suggestions
   - Function declaration templates
   - Syntax validation

## Architecture

The compiler is designed to be completely client-side with no backend dependencies:

```
┌─────────────────────┐
│   Browser Client    │
├─────────────────────┤
│  SimpleCodingEnv    │
│  Component          │
├─────────────────────┤
│ SimpleCodeExecution │
│  Service            │
└─────────────────────┘
```

## Limitations

This is a simplified implementation for demonstration purposes:

- Code execution is simulated rather than truly executed
- Security sandboxing is not implemented
- Advanced language features are not fully supported
- No persistent storage of code snippets

## Future Enhancements

- Integration with Monaco Editor for advanced editing features
- True code execution via Web Workers or WASM
- Enhanced syntax checking with AST parsing
- Code snippet library and sharing capabilities
- Performance profiling and optimization tools