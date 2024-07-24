import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CreateEmployee, FilterEmployee, GetCategory, getEmployee } from 'src/app/shared/interfaces/employee.interface';
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

  getAllEmployees(): Observable<getEmployee[]> {
    return this.http.get<getEmployee[]>(`${this.api}/employee`)
  }

  getEmployees(filterData: FilterEmployee): Observable<{ total: number, employees: getEmployee[] }> {
    return this.http.post<{ total: number, employees: getEmployee[] }>(`${this.api}/employee/get`, filterData)
  }

  createEmployees(employeeData: CreateEmployee) {
    return this.http.post(`${this.api}/employee`, employeeData)
  }

  // getPasswordOfEmployee(employeeId:string){
  //   console.log(employeeId)
  //   return this.http.get(`${this.api}/employee/getPasswordOfEmployee/${employeeId}`)
  // }

  changePasswordOfEmployee(passwords:object){
      console.log(passwords)
      return this.http.patch(`${this.api}/employee/changePassword`,passwords)
  }

  editEmployees(employeeData: CreateEmployee) {
    console.log(employeeData)
    console.log("reached service")
    return this.http.patch(`${this.api}/employee/edit`, employeeData)
  }

  createCategory(categroyData: GetCategory) {
    return this.http.post(`${this.api}/category`, categroyData)
  }

  getCategory():Observable<GetCategory[]> {
    return this.http.get<GetCategory[]>(`${this.api}/category`)
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
