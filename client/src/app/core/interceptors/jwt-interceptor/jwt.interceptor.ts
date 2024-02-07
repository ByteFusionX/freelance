import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeService } from '../../services/employee/employee.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private _employeeService: EmployeeService) { }
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    let token: string | null = this._employeeService.getToken()
    if (token) {
      const modifiedReq = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      })
      return next.handle(modifiedReq)
    }

    return next.handle(request)
  }
}
