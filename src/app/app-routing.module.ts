// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreloaderComponent } from './components/preloader/preloader.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { ExamDashboardComponent } from './components/exam-dashboard/exam-dashboard.component';
import { ResultsPageComponent } from './components/results-page/results-page.component';
import { SimpleCodingEnvComponent } from './components/simple-coding-env/simple-coding-env.component';
import { CompilerDemoComponent } from './components/compiler-demo/compiler-demo.component';
import { AuthGuard } from './guards/auth.guard';
import { TabSwitchGuard } from './guards/tab-switch.guard';

const routes: Routes = [
  { path: '', component: PreloaderComponent },
  { path: 'demo', component: CompilerDemoComponent },
  { path: 'compiler', component: SimpleCodingEnvComponent },
  { path: 'registration', component: RegistrationComponent },
  { 
    path: 'exam', 
    component: ExamDashboardComponent,
    canActivate: [AuthGuard],
    canDeactivate: [TabSwitchGuard]
  },
  { 
    path: 'results', 
    component: ResultsPageComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }