import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
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
    console.log(employeeData)
    return this.http.post(`${this.api}/employee/login`,employeeData)
  }
}
