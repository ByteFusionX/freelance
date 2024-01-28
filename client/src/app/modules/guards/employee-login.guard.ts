import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn:'root'
})

export class employeeLoginGuard implements CanActivate {
  constructor(private router:Router){}
  canActivate():boolean{
    const employeeId = localStorage.getItem('employeeToken')
    if(employeeId){
      return true;

    }else{
      this.router.navigate(['/login'])
      return false
    }
  }
  
};
