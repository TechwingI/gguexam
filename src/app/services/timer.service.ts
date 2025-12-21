import { Injectable } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private timeRemaining: number = 3600;
  private timerSubject = new Subject<number>();
  private timerComplete = new Subject<void>();
  private isRunning: boolean = false;

  startTimer(): Observable<number> {
    this.isRunning = true;
    return interval(1000).pipe(
      takeWhile(() => this.isRunning && this.timeRemaining > 0),
      map(() => {
        this.timeRemaining--;
        this.timerSubject.next(this.timeRemaining);
        if (this.timeRemaining <= 0) {
          this.stopTimer();
          this.timerComplete.next();
        }
        return this.timeRemaining;
      })
    );
  }

  stopTimer(): void {
    this.isRunning = false;
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  resetTimer(): void {
    this.timeRemaining = 3600;
    this.isRunning = false;
  }

  setTimeRemaining(time: number): void {
    this.timeRemaining = time;
  }

  onTimerComplete(): Observable<void> {
    return this.timerComplete.asObservable();
  }

  getTimeRemaining(): number {
    return this.timeRemaining;
  }
}
