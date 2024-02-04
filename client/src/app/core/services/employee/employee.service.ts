import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { login } from 'src/app/shared/interfaces/login';
import { environment } from 'src/environments/environment';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  api: string = environment.api
  employeeSubject = new BehaviorSubject<getEmployee | undefined>(undefined)
  employeeData$ = this.employeeSubject.asObservable()
  constructor(private http: HttpClient) { }

  getEmployees(): Observable<getEmployee[]> {
    return this.http.get<getEmployee[]>(`${this.api}/employee`)
  }

  createEmployees(employeeData: getEmployee) {
    return this.http.post(`${this.api}/employee`, employeeData)
  }

  employeeLogin(employeeData: Object): Observable<login> {
    return this.http.post(`${this.api}/employee/login`, employeeData)
  }

  getToken(): string | null {
    return <string | null>localStorage.getItem('employeeToken')
  }

  employeeToken(): any {
    let token = this.getToken()
    if (token) {
      const decodedToken = <{ id: string, employeeId: string }>jwtDecode(token);
      return decodedToken
    }
  }

  getEmployee(id: string) {
    return this.http.get<getEmployee>(`${this.api}/employee/get/${id}`)
  }

  getEmployeeData(id: string) {
    this.getEmployee(id).subscribe(
      (employeeData: getEmployee) => {
        this.employeeSubject.next(employeeData);
      }
    );
  }
}
