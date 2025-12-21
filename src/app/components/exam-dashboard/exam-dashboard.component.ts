// src/app/components/exam-dashboard/exam-dashboard.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ExamService } from '../../services/exam.service';
import { TimerService } from '../../services/timer.service';
import { FirebaseRealtimeService } from '../../services/firebase-realtime.service';
import { Question, ExamData } from '../../models/exam';

@Component({
  selector: 'app-exam-dashboard',
  templateUrl: './exam-dashboard.component.html',
  styleUrls: ['./exam-dashboard.component.css']
})
export class ExamDashboardComponent implements OnInit, OnDestroy {
  currentQuestionIndex = 0;
  currentSection = 'Aptitude';
  progress = 0;
  timer = '60:00';
  isExamInProgress = true;
  violations = 0; // Track violations in the component

  showCodingEnv = false;
  codingQuestionIndex = 0;

  private timerSub: Subscription | null = null;
  private keydownHandler: any;
  private contextMenuHandler: any;
  private visibilityChangeHandler: any;

  constructor(
    public examService: ExamService,
    private timerService: TimerService,
    private router: Router,
    private realtime: FirebaseRealtimeService
  ) {}

  async ngOnInit(): Promise<void> {
    const user = this.examService.getUser();
    if (!user) {
      this.router.navigate(['/registration']);
      return;
    }

    this.isExamInProgress = true;
    
    // Reset violations when starting a new exam session
    this.examService.resetViolations();
    this.violations = 0;
    
    // Load questions
    const fullSet: ExamData = await this.realtime.getFullQuestionSet(user.course);
    this.examService.setFullExamData(fullSet);

    // Set timer from saved state
    const savedTime = this.examService.getTimeRemaining();
    this.timerService.setTimeRemaining(savedTime);
    
    this.loadQuestion(0);
    this.startTimer();
    this.setupSecurityMeasures();
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.cleanupSecurityMeasures();
  }

  private setupSecurityMeasures(): void {
    this.disableRightClick();
    this.disableKeyboardShortcuts();
    this.setupTabSwitchDetection();
    this.preventDirectNavigation();
  }

  private disableRightClick(): void {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      this.showSecurityWarning('Right-click is disabled during the exam.');
      this.recordViolation(); // Record violation
      return false;
    };
    document.addEventListener('contextmenu', handler);
    this.contextMenuHandler = handler;
  }

  private disableKeyboardShortcuts(): void {
    const handler = (e: KeyboardEvent) => {
      if (!this.isExamInProgress) return true;
      
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;
      
      // Block developer tools and screenshot shortcuts
      if (
        (ctrl && shift && (key === 'c' || key === 'i' || key === 'j')) || // Dev tools
        (ctrl && key === 'u') || // View source
        (ctrl && key === 's') || // Save page
        (ctrl && key === 'p') || // Print
        (ctrl && key === 'f') || // Find
        (key === 'f12') || // Dev tools
        (alt && key === 'printscreen') || // Print screen
        (ctrl && alt && key === 'i') // Another dev tools shortcut
      ) {
        e.preventDefault();
        e.stopPropagation();
        this.showSecurityWarning(`Shortcut ${e.key} with modifiers is disabled during the exam.`);
        this.recordViolation(); // Only record violation for these specific shortcuts
        return false;
      }
      
      return true;
    };
    
    document.addEventListener('keydown', handler, true);
    this.keydownHandler = handler;
  }

  private setupTabSwitchDetection(): void {
    const visibilityHandler = () => {
      if (this.isExamInProgress && document.hidden) {
        this.showSecurityWarning('Tab/window switch detected. Please stay on the exam page.');
        this.recordViolation(); // Record violation for tab switching
      }
    };
    
    document.addEventListener('visibilitychange', visibilityHandler);
    this.visibilityChangeHandler = visibilityHandler;
    
    window.addEventListener('blur', () => {
      if (this.isExamInProgress) {
        setTimeout(() => {
          if (!document.hasFocus()) {
            this.showSecurityWarning('Window focus lost. Please focus on the exam window.');
            this.recordViolation(); // Record violation for window blur
          }
        }, 100);
      }
    });
  }

  private preventDirectNavigation(): void {
    // Prevent direct URL navigation
    window.addEventListener('popstate', (e) => {
      if (this.isExamInProgress) {
        e.preventDefault();
        this.showSecurityWarning('Direct navigation is not allowed. Please use the navigation buttons.');
        this.recordViolation(); // Record violation
        window.history.pushState(null, '', '/exam');
      }
    });
  }

  private showViolationNotification(): void {
    const violationDiv = document.createElement('div');
    violationDiv.className = 'fixed bottom-4 right-4 z-50 max-w-md';
    violationDiv.innerHTML = `
      <div class="bg-gradient-to-r from-red-900/95 to-red-800/95 backdrop-blur-xl rounded-lg p-4 border-2 border-red-500/50 shadow-2xl">
        <div class="flex items-start">
          <div class="w-10 h-10 mr-3 flex items-center justify-center rounded-full bg-red-500/30 border-2 border-red-500/50 flex-shrink-0">
            <i class="ri-error-warning-line text-xl text-red-300"></i>
          </div>
          <div class="flex-1">
            <h4 class="text-lg font-bold text-white mb-1">⚠️ Violation Recorded</h4>
            <p class="text-red-200 text-sm">Violation #${this.violations} recorded. ${8 - this.violations} violations remaining before auto-submission.</p>
          </div>
          <button class="ml-2 text-red-300 hover:text-white" onclick="this.parentElement.parentElement.remove()">
            <i class="ri-close-line text-xl"></i>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(violationDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(violationDiv)) {
        violationDiv.style.opacity = '0';
        violationDiv.style.transition = 'opacity 0.3s';
        setTimeout(() => violationDiv.remove(), 300);
      }
    }, 5000);
  }

  private recordViolation(): void {
    this.examService.addViolation();
    this.violations = this.examService.getViolations();
    
    // Show violation count to user
    this.showViolationNotification();
    
    // Check if violations have reached the limit (8th violation)
    if (this.violations >= 8) {
      this.autoSubmitExam();
    }
  }

  private autoSubmitExam(): void {
    // Show auto-submit notification
    const autoSubmitDiv = document.createElement('div');
    autoSubmitDiv.id = 'autoSubmitDialog';
    autoSubmitDiv.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg';
    autoSubmitDiv.innerHTML = `
      <div class="bg-gradient-to-br from-red-900 to-red-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-red-500/50">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-500/30 border-2 border-red-500/50">
            <i class="ri-error-warning-line text-3xl text-red-300"></i>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Exam Auto-Submitted</h2>
          <p class="text-red-200 mb-6">Maximum violations (8) exceeded. Your exam has been automatically submitted.</p>
          <div class="bg-red-800/50 rounded-lg p-4 mb-6">
            <p class="text-sm text-red-200">Reason: Excessive security violations detected during exam</p>
          </div>
          <button 
            id="autoSubmitBtn"
            class="w-full py-3 bg-white text-red-900 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg">
            View Results
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(autoSubmitDiv);
    
    // Add event listener to the button
    const btn = document.getElementById('autoSubmitBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        // Remove the dialog before navigating
        if (document.getElementById('autoSubmitDialog')) {
          document.getElementById('autoSubmitDialog')!.remove();
        }
        this.submitExam();
      });
    }
    
    // Also submit the exam automatically after a delay
    setTimeout(() => {
      // Remove the dialog before navigating
      if (document.getElementById('autoSubmitDialog')) {
        document.getElementById('autoSubmitDialog')!.remove();
      }
      this.submitExam();
    }, 5000);
  }

  private showSecurityWarning(message: string): void {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'fixed top-4 right-4 z-50 max-w-md';
    warningDiv.innerHTML = `
      <div class="bg-gradient-to-r from-yellow-900/95 to-yellow-800/95 backdrop-blur-xl rounded-lg p-4 border-2 border-yellow-500/50 shadow-2xl">
        <div class="flex items-start">
          <div class="w-10 h-10 mr-3 flex items-center justify-center rounded-full bg-yellow-500/30 border-2 border-yellow-500/50 flex-shrink-0">
            <i class="ri-alert-line text-xl text-yellow-300"></i>
          </div>
          <div class="flex-1">
            <h4 class="text-lg font-bold text-white mb-1">⚠️ Security Warning</h4>
            <p class="text-yellow-200 text-sm">${message}</p>
          </div>
          <button class="ml-2 text-yellow-300 hover:text-white" onclick="this.parentElement.parentElement.remove()">
            <i class="ri-close-line text-xl"></i>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(warningDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(warningDiv)) {
        warningDiv.style.opacity = '0';
        warningDiv.style.transition = 'opacity 0.3s';
        setTimeout(() => warningDiv.remove(), 300);
      }
    }, 5000);
  }

  private cleanupSecurityMeasures(): void {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler, true);
    }
    if (this.contextMenuHandler) {
      document.removeEventListener('contextmenu', this.contextMenuHandler);
    }
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.isExamInProgress) {
      $event.returnValue = 'Your exam will be submitted if you leave this page. Are you sure?';
    }
  }


  startTimer(): void {
    this.timerSub = this.timerService.startTimer().subscribe(() => {
      this.timer = this.timerService.getFormattedTime();
      this.examService.setTimeRemaining(this.timerService.getTimeRemaining());
      
      // Auto-submit when time is up
      if (this.timerService.getTimeRemaining() <= 0) {
        this.submitExam();
      }
    });
  }

  stopTimer(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
      this.timerSub = null;
    }
    this.timerService.stopTimer();
  }

  loadQuestion(index: number): void {
    const data = this.examService.getExamData();
    const mcqTotal = data.aptitude.length + data.verbal.length + data.technical.length;
    const codingTotal = data.coding.length;
    const maxIndex = mcqTotal + codingTotal - 1;

    if (maxIndex < 0) return;
    if (index > maxIndex) index = maxIndex;
    if (index < 0) index = 0;

    this.currentQuestionIndex = index;
    this.examService.setCurrentQuestion(index);
    this.updateSection();
    this.updateProgress();

    if (index < mcqTotal) {
      this.showCodingEnv = false;
    } else if (index < mcqTotal + codingTotal) {
      this.showCodingEnv = true;
      this.codingQuestionIndex = index - mcqTotal;
    } else {
      this.showCodingEnv = false;
    }
  }

  updateSection(): void {
    const data = this.examService.getExamData();
    const aLen = data.aptitude.length;
    const vLen = data.verbal.length;
    const tLen = data.technical.length;

    if (this.currentQuestionIndex < aLen) {
      this.currentSection = 'Aptitude';
    } else if (this.currentQuestionIndex < aLen + vLen) {
      this.currentSection = 'Verbal';
    } else if (this.currentQuestionIndex < aLen + vLen + tLen) {
      this.currentSection = 'Technical';
    } else {
      this.currentSection = 'Coding';
    }
  }

  updateProgress(): void {
    const answered = Object.keys(this.examService.getAnswers()).length;
    const total = this.examService.getTotalQuestions();
    this.progress = total ? (answered / total) * 100 : 0;
  }

  getAnsweredCount(): number {
    return Object.keys(this.examService.getAnswers()).length;
  }

  selectAnswer(qIndex: number, aIndex: number): void {
    this.examService.setAnswer(qIndex, aIndex);
    this.updateProgress();
  }

  nextQuestion(): void {
    const total = this.examService.getTotalQuestions();
    if (this.currentQuestionIndex < total - 1) {
      this.loadQuestion(this.currentQuestionIndex + 1);
    } else {
      this.submitExam();
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.loadQuestion(this.currentQuestionIndex - 1);
    }
  }

  submitExam(): void {
    this.stopTimer();
    this.isExamInProgress = false;
    // Mark user as completed
    const user = this.examService.getUser();
    if (user) {
      user.completed = true;
      this.examService.setUser(user);
    }
    this.router.navigate(['/results']);
  }

  getCurrentQuestion(): Question | null {
    const data = this.examService.getExamData();
    const aLen = data.aptitude.length;
    const vLen = data.verbal.length;
    const tLen = data.technical.length;

    if (this.currentQuestionIndex < aLen) {
      return data.aptitude[this.currentQuestionIndex];
    } else if (this.currentQuestionIndex < aLen + vLen) {
      return data.verbal[this.currentQuestionIndex - aLen];
    } else if (this.currentQuestionIndex < aLen + vLen + tLen) {
      return data.technical[this.currentQuestionIndex - aLen - vLen];
    }
    return null;
  }

  isAnswered(index: number): boolean {
    return this.examService.getAnswers()[index] !== undefined;
  }

  getAnswer(index: number): any {
    return this.examService.getAnswers()[index];
  }

  getQuestionButtonClass(index: number): string {
    const base = 'w-8 h-8 rounded text-sm font-medium transition-all duration-200';
    if (index === this.currentQuestionIndex) {
      return `${base} bg-yellow-500 text-black shadow-lg scale-105`;
    }
    if (this.isAnswered(index)) {
      return `${base} bg-green-500 text-white hover:bg-green-600`;
    }
    return `${base} bg-white/30 text-white hover:bg-white/40`;
  }

  getOptionClass(qIndex: number, oIndex: number): string {
    const base = 'flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300';
    if (this.getAnswer(qIndex) === oIndex) {
      return base + ' bg-primary/20 border-2 border-primary/50 shadow-md';
    }
    return base + ' bg-white/10 hover:bg-white/20';
  }

  getIndexes(section: 'aptitude' | 'verbal' | 'technical' | 'coding'): number[] {
    const data = this.examService.getExamData();
    let start = 0;
    let len = 0;

    if (section === 'aptitude') {
      start = 0;
      len = data.aptitude.length;
    } else if (section === 'verbal') {
      start = data.aptitude.length;
      len = data.verbal.length;
    } else if (section === 'technical') {
      start = data.aptitude.length + data.verbal.length;
      len = data.technical.length;
    } else {
      const mcqTotal = data.aptitude.length + data.verbal.length + data.technical.length;
      start = mcqTotal;
      len = data.coding.length;
    }

    return Array.from({ length: len }, (_, i) => start + i);
  }
}