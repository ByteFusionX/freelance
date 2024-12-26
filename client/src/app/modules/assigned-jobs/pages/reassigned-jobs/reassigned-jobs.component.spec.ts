import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassignedJobsComponent } from './reassigned-jobs.component';

describe('ReassignedJobsComponent', () => {
  let component: ReassignedJobsComponent;
  let fixture: ComponentFixture<ReassignedJobsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReassignedJobsComponent]
    });
    fixture = TestBed.createComponent(ReassignedJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
