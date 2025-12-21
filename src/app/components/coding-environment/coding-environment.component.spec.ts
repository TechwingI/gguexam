import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingEnvironmentComponent } from './coding-environment.component';

describe('CodingEnvironmentComponent', () => {
  let component: CodingEnvironmentComponent;
  let fixture: ComponentFixture<CodingEnvironmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodingEnvironmentComponent]
    });
    fixture = TestBed.createComponent(CodingEnvironmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
