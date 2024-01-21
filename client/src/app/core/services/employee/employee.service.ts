import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { getEmployee, getEmployeeObject } from 'src/app/shared/interfaces/employee.interface';
import { login } from 'src/app/shared/interfaces/login';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private userDetailsSubject: BehaviorSubject<getEmployeeObject | null> = new BehaviorSubject<getEmployeeObject | null>(null);
  userDetails$: Observable<getEmployeeObject | null> = this.userDetailsSubject.asObservable();


  api: string = environment.api
  constructor(private http: HttpClient) { }
  
  getEmployees():Observable<getEmployee[]>{
    return this.http.get<getEmployee[]>(`${this.api}/employee`)
  }

  createEmployees(employeeData:getEmployee){
    return this.http.post(`${this.api}/employee`,employeeData)
  }

  employeeLogin(employeeData:Object):Observable<login>{
    return this.http.post(`${this.api}/employee/login`,employeeData)
  }
  setUserDetails(employeeData: getEmployeeObject): void {
    
    this.userDetailsSubject.next(employeeData);
    
  }
  
  getEmployeeData(employeeId:string){
   
    return this.http.get<getEmployeeObject>(`${this.api}/employee/getEmployeeData/${employeeId}`).pipe(
     
      tap((employeeData) => {
        
        this.setUserDetails(employeeData)
      }),
    );
  }
}
