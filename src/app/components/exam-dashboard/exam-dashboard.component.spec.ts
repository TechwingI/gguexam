import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamDashboardComponent } from './exam-dashboard.component';

describe('ExamDashboardComponent', () => {
  let component: ExamDashboardComponent;
  let fixture: ComponentFixture<ExamDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExamDashboardComponent]
    });
    fixture = TestBed.createComponent(ExamDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
