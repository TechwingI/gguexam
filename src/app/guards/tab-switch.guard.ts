// src/app/guards/tab-switch.guard.ts
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { ExamDashboardComponent } from '../components/exam-dashboard/exam-dashboard.component';

@Injectable({
  providedIn: 'root'
})
export class TabSwitchGuard implements CanDeactivate<ExamDashboardComponent> {
  
  canDeactivate(
    component: ExamDashboardComponent,
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (component && component.isExamInProgress) {
      // Show error message instead of allowing navigation
      this.showSecurityError('Direct navigation is not allowed during the exam. Please use the navigation buttons.');
      return false;
    }
    return true;
  }

  private showSecurityError(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed inset-0 flex items-center justify-center z-50';
    errorDiv.innerHTML = `
      <div class="absolute inset-0 bg-black/80"></div>
      <div class="relative bg-gradient-to-br from-red-900/95 to-red-800/95 backdrop-blur-xl rounded-2xl p-8 m-4 max-w-lg border-2 border-red-500/50 shadow-2xl">
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-500/40 border-2 border-red-500/50">
            <i class="ri-error-warning-line text-4xl text-red-300"></i>
          </div>
          <h3 class="text-2xl font-bold text-white mb-3">⚠️ Security Warning</h3>
          <p class="text-red-200 mb-6">${message}</p>
          <button id="error-ok-btn" class="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all">
            I Understand
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      const okBtn = document.getElementById('error-ok-btn');
      if (okBtn) {
        okBtn.onclick = () => {
          document.body.removeChild(errorDiv);
        };
      }
    }, 100);
  }
}