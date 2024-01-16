import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { employeeLoginGuard } from './employee-login.guard';

describe('employeeLoginGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => employeeLoginGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
