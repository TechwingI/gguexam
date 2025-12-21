// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ExamService } from '../services/exam.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private examService: ExamService
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const user = this.examService.getUser();
    const isRegistered = user && user.uid;
    
    if (!isRegistered) {
      this.router.navigate(['/registration']);
      return false;
    }
    
    return true;
  }
}