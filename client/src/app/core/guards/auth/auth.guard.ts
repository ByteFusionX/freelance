import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Location } from '@angular/common';

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const token = <string>localStorage.getItem('employeeToken')
  const router: Router = inject(Router);
  const location = inject(Location)
  let isLogin: boolean = state.url.includes('login')

  if (isLogin === true && !token || isLogin === false && token) {
    return true
  } else if (!isLogin && !token) {
    router.navigate(['/login'])
    return false
  } else {
    location.back()
    return false
  }
};
