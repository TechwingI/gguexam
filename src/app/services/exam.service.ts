import { Injectable } from '@angular/core';
import {
  ExamData,
  Question,
  CodingQuestion,
  User,
  Answer,
  ExamState
} from '../models/exam';

@Injectable({ providedIn: 'root' })
export class ExamService {
  private examData: ExamData = {
    aptitude: [],
    verbal: [],
    technical: [],
    coding: []
  };

  private state: ExamState = {
    currentQuestion: 0,
    answers: {},
    timeRemaining: 3600,
    user: null,
    courseQuestions: [],
    violations: 0 // Initialize violations counter
  };

  constructor() {
    this.loadFromLocalStorage();
  }

  private getLocalStorageKey(prefix: string): string {
    const user = this.state.user;
    if (user && user.uid) {
      return `${prefix}_${user.uid}`;
    }
    return prefix;
  }

  private loadFromLocalStorage(): void {
    const savedState = localStorage.getItem(this.getLocalStorageKey('examState'));
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        this.state = { ...this.state, ...parsed };
      } catch (e) {
        console.error('Failed to load state', e);
      }
    }
    
    const savedUser = localStorage.getItem('examUser');
    if (savedUser) {
      try {
        this.state.user = JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to load user', e);
      }
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(
      this.getLocalStorageKey('examState'),
      JSON.stringify({
        currentQuestion: this.state.currentQuestion,
        answers: this.state.answers,
        timeRemaining: this.state.timeRemaining,
        courseQuestions: this.state.courseQuestions,
        violations: this.state.violations // Save violations to localStorage
      })
    );
    if (this.state.user) {
      localStorage.setItem('examUser', JSON.stringify(this.state.user));
    }
  }

  setFullExamData(data: ExamData): void {
    this.examData = data;
    this.state.courseQuestions = data.coding;
    this.saveToLocalStorage();
  }

  getExamData(): ExamData {
    return this.examData;
  }

  getRegularQuestion(
    section: 'aptitude' | 'verbal' | 'technical',
    index: number
  ): Question {
    return this.examData[section][index];
  }

  getCodingQuestion(index: number): CodingQuestion | undefined {
    return this.state.courseQuestions[index];
  }

  getCurrentQuestion(): number {
    return this.state.currentQuestion;
  }

  setCurrentQuestion(index: number): void {
    this.state.currentQuestion = index;
    this.saveToLocalStorage();
  }

  getAnswers(): Answer {
    return this.state.answers;
  }

  setAnswer(index: number, answer: any): void {
    this.state.answers[index] = answer;
    this.saveToLocalStorage();
  }

  getUser(): User | null {
    return this.state.user;
  }

  setUser(user: User): void {
    this.state.user = user;
    this.saveToLocalStorage();
  }

  getTimeRemaining(): number {
    return this.state.timeRemaining;
  }

  setTimeRemaining(time: number): void {
    this.state.timeRemaining = time;
    this.saveToLocalStorage();
  }

  // Violation tracking methods
  getViolations(): number {
    return this.state.violations;
  }

  addViolation(): void {
    this.state.violations++;
    this.saveToLocalStorage();
    
    // If violations exceed 7 (8th violation), auto-submit the exam
    if (this.state.violations >= 8) {
      this.autoSubmitExam();
    }
  }

  autoSubmitExam(): void {
    // This method will be called when violations reach 7
    console.log('Auto-submitting exam due to excessive violations');
    // Emit an event or set a flag that the exam dashboard can listen to
    // For now, we'll just log it as the actual navigation is handled in the component
  }

  // DYNAMIC calculation – works for any counts in each section
  calculateResults() {
    const data = this.examData;

    const sections: ('aptitude' | 'verbal' | 'technical')[] = [
      'aptitude',
      'verbal',
      'technical'
    ];

    let correct = 0;
    let total = 0;

    const sectionWise = {
      aptitude: 0,
      verbal: 0,
      technical: 0,
      coding: 0
    };

    // MCQ sections
    sections.forEach((section) => {
      const questions = data[section];

      questions.forEach((q, qIndex) => {
        let offset = 0;
        if (section === 'verbal') {
          offset = data.aptitude.length;
        } else if (section === 'technical') {
          offset = data.aptitude.length + data.verbal.length;
        }
        const globalIndex = offset + qIndex;

        total++;
        if (this.state.answers[globalIndex] === q.correct) {
          correct++;
          if (section === 'aptitude') sectionWise.aptitude++;
          if (section === 'verbal') sectionWise.verbal++;
          if (section === 'technical') sectionWise.technical++;
        }
      });
    });

    // Coding section – index starts after all MCQs
    const mcqTotalLen =
      data.aptitude.length + data.verbal.length + data.technical.length;

    this.state.courseQuestions.forEach((_, idx) => {
      const globalIndex = mcqTotalLen + idx;
      total++;
      // simple rule: if user wrote anything, count as correct
      if (this.state.answers[globalIndex]) {
        correct++;
        sectionWise.coding++;
      }
    });

    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      correct,
      total,
      percentage,
      incorrect: total - correct,
      sectionWise
    };
  }

  getTotalQuestions(): number {
    return (
      this.examData.aptitude.length +
      this.examData.verbal.length +
      this.examData.technical.length +
      this.state.courseQuestions.length
    );
  }

  getCodeSubmissions(): { [k: string]: string } {
    const submissions: { [k: string]: string } = {};
    const mcqTotalLen =
      this.examData.aptitude.length +
      this.examData.verbal.length +
      this.examData.technical.length;

    this.state.courseQuestions.forEach((q, i) => {
      const globalIndex = mcqTotalLen + i;
      if (this.state.answers[globalIndex]) {
        submissions[q.id || `coding_${i}`] = this.state.answers[globalIndex];
      }
    });
    return submissions;
  }

  resetExam(): void {
    const currentUser = this.state.user;
    this.state = {
      currentQuestion: 0,
      answers: {},
      timeRemaining: 3600,
      user: currentUser, // Keep the current user
      courseQuestions: [],
      violations: 0 // Reset violations counter
    };
    localStorage.removeItem(this.getLocalStorageKey('examState'));
    // Don't remove examUser as it's shared across sessions
  }

  resetViolations(): void {
    this.state.violations = 0;
    this.saveToLocalStorage();
  }
}