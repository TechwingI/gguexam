// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { SnowService } from './services/snow.service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <div id="snowfall-container" class="fixed inset-0 pointer-events-none z-10"></div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Glacier Exam Portal';

  constructor(private snowService: SnowService) {}

  ngOnInit(): void {
    this.snowService.createSnowfall('snowfall-container');
  }
}