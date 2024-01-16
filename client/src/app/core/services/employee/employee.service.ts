import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getEmployee, getEmployeeObject } from 'src/app/shared/interfaces/employee.interface';
import { login } from 'src/app/shared/interfaces/login';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

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
  
  getEmployeeData(employeeId:string){
    return this.http.get<getEmployeeObject>(`${this.api}/employee/getEmployeeData/${employeeId}`)
  }
}
