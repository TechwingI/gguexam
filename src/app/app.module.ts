// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PreloaderComponent } from './components/preloader/preloader.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { ExamDashboardComponent } from './components/exam-dashboard/exam-dashboard.component';
import { ResultsPageComponent } from './components/results-page/results-page.component';
import { CodingEnvironmentComponent } from './components/coding-environment/coding-environment.component';
import { SimpleCodingEnvComponent } from './components/simple-coding-env/simple-coding-env.component';
import { CompilerDemoComponent } from './components/compiler-demo/compiler-demo.component';
import { SimpleCodeExecutionService } from './services/simple-code-execution.service';

import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    PreloaderComponent,
    RegistrationComponent,
    ExamDashboardComponent,
    ResultsPageComponent,
    CodingEnvironmentComponent,
    SimpleCodingEnvComponent,
    CompilerDemoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    // Firebase v9+ modular initialization
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase())
  ],
  providers: [
    SimpleCodeExecutionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }