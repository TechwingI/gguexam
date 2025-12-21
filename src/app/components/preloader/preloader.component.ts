import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preloader',
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.css']
})
export class PreloaderComponent implements OnInit {
  loadingPercentage: number = 0;
  isVisible: boolean = true;
  loadingMessages = [
    '🎄 Loading Christmas magic...',
    '❄️ Preparing coding challenges...',
    '🎁 Setting up the exam environment...',
    '🦌 Getting reindeer ready...',
    '✨ Adding festive sparkles...'
  ];
  currentMessage: string = this.loadingMessages[0];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.simulateLoading();
  }

  simulateLoading(): void {
    let messageIndex = 0;
    const interval = setInterval(() => {
      this.loadingPercentage += Math.random() * 10 + 5;
      if (this.loadingPercentage >= 25 * (messageIndex + 1) && messageIndex < this.loadingMessages.length - 1) {
        messageIndex++;
        this.currentMessage = this.loadingMessages[messageIndex];
      }
      if (this.loadingPercentage >= 100) {
        this.loadingPercentage = 100;
        clearInterval(interval);
        setTimeout(() => {
          this.isVisible = false;
          setTimeout(() => {
            this.router.navigate(['/registration']);
          }, 500);
        }, 1000);
      }
    }, 200);
  }
}
