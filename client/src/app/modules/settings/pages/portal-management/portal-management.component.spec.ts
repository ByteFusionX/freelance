import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalManagementComponent } from './portal-management.component';

describe('PortalManagementComponent', () => {
  let component: PortalManagementComponent;
  let fixture: ComponentFixture<PortalManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PortalManagementComponent]
    });
    fixture = TestBed.createComponent(PortalManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
