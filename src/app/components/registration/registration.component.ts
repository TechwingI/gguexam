// src/app/components/registration/registration.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { FirebaseRealtimeService } from '../../services/firebase-realtime.service';
import { User } from '../../models/exam';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  username = '';
  email = '';
  password = '';
  pin = '';
  mobile = '';
  selectedGroup = '';
  selectedCourse = '';

  showGroupDropdown = false;
  showCourseDropdown = false;

  groups = [
    { value: 'CSE', label: 'Computer Science Engineering (CSE)' },
    { value: 'CSD', label: 'Computer Science & Design (CSD)' },
    { value: 'ECE', label: 'Electronics & Communication (ECE)' },
    { value: 'CSM', label: 'Computer Science & Mathematics (CSM)' },
    { value: 'CSC', label: 'Computer Science & Cybersecurity (CSC)' },
    { value: 'EEE', label: 'Electrical & Electronics (EEE)' },
    { value: 'AIML', label: 'Artificial Intelligence & ML (AIML)' }
  ];

  courses = [
    { value: 'JFS+UIUX', label: 'Java Full Stack + UI/UX Design' },
    { value: 'JFS+AWS', label: 'Java Full Stack + AWS Cloud' },
    { value: 'AWS+DevOps', label: 'AWS Cloud + DevOps Engineering' },
    { value: 'AWS+GenAI', label: 'AWS Cloud + Generative AI' }
  ];

  constructor(
    private router: Router,
    private examService: ExamService,
    private realtime: FirebaseRealtimeService
  ) {}

  ngOnInit(): void {
    // Reset the exam state for a fresh start
    this.examService.resetExam();
  }

  toggleGroupDropdown(): void {
    this.showGroupDropdown = !this.showGroupDropdown;
    this.showCourseDropdown = false;
  }

  toggleCourseDropdown(): void {
    this.showCourseDropdown = !this.showCourseDropdown;
    this.showGroupDropdown = false;
  }

  onPinKeyPress(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    // Only allow digits (0-9)
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  selectGroup(group: any): void {
    this.selectedGroup = group.value;
    this.showGroupDropdown = false;
  }

  selectCourse(course: any): void {
    this.selectedCourse = course.value;
    this.showCourseDropdown = false;
  }

  getSelectedGroupLabel(): string {
    if (!this.selectedGroup) return 'Choose Group';
    const g = this.groups.find((x) => x.value === this.selectedGroup);
    return g ? g.label : 'Choose Group';
  }

  getSelectedCourseLabel(): string {
    if (!this.selectedCourse) return 'Choose Combo Course';
    const c = this.courses.find((x) => x.value === this.selectedCourse);
    return c ? c.label : 'Choose Combo Course';
  }

  async onSubmit(): Promise<void> {
    try {
      // Validation
      if (!this.username.trim() || !this.email.trim() || !this.password.trim()) {
        this.showNotification('Please fill in all required fields');
        return;
      }

      if (!this.selectedGroup || !this.selectedCourse) {
        this.showNotification('Please select both group and course');
        return;
      }

      if (!/\S+@\S+\.\S+/.test(this.email)) {
        this.showNotification('Enter a valid email address');
        return;
      }

      if (!/^\d{10}$/.test(this.mobile)) {
        this.showNotification('Mobile number must be 10 digits');
        return;
      }

      if (!/^\d{10}$/.test(this.pin)) {
        this.showNotification('PIN must be exactly 10 digits');
        return;
      }

      // Check if email exists
      const exists = await this.realtime.emailExists(this.email);
      if (exists) {
        this.showNotification('Email already registered');
        return;
      }

      // Generate user ID
      const uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      const user: User = {
        uid,
        username: this.username,
        email: this.email,
        pin: this.pin,
        mobile: this.mobile,
        group: this.selectedGroup,
        course: this.selectedCourse,
        started: false,
        completed: false,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Save to Firebase
      await this.realtime.saveUser(user);
      
      // Save to local storage and exam service
      this.examService.setUser(user);
      localStorage.setItem('examUser', JSON.stringify(user));

      this.showNotification('Successfully registered! Redirecting to exam...', 'success');
      
      // Navigate to exam after short delay
      setTimeout(() => {
        this.router.navigate(['/exam']);
      }, 1500);
      
    } catch (err: any) {
      console.error('Registration error:', err);
      this.showNotification(err.message || 'Registration failed. Please try again.');
    }
  }

  private showNotification(message: string, type: 'error' | 'success' = 'error'): void {
    const notification = document.createElement('div');
    notification.className = `
      fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300
      ${type === 'error' ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'}
      backdrop-blur-lg
    `;
    
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <div class="w-5 h-5 flex items-center justify-center">
          ${type === 'error' ? '<i class="ri-error-warning-line"></i>' : '<i class="ri-checkbox-circle-line"></i>'}
        </div>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}