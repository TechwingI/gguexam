import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-compiler-demo',
  templateUrl: './compiler-demo.component.html',
  styleUrls: ['./compiler-demo.component.css']
})
export class CompilerDemoComponent implements OnInit {

  features = [
    {
      title: 'Multi-language Support',
      description: 'Write code in JavaScript, Python, Java, or C++',
      icon: '🌐'
    },
    {
      title: 'Intelligent Suggestions',
      description: 'Get contextual code suggestions as you type',
      icon: '💡'
    },
    {
      title: 'Real-time Error Detection',
      description: 'Identify syntax errors with line-by-line highlighting',
      icon: '🔍'
    },
    {
      title: 'Test Case Execution',
      description: 'Run your code against multiple test cases',
      icon: '✅'
    },
    {
      title: 'No Backend Required',
      description: 'Everything runs directly in your browser',
      icon: '⚡'
    },
    {
      title: 'Clean Interface',
      description: 'Distraction-free coding environment',
      icon: '✨'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  navigateToCompiler(): void {
    this.router.navigate(['/']);
  }
}