import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, filter, Observable, switchMap } from 'rxjs';
import { CreateEmployee, FilterEmployee, GetCategory, getEmployee, getEmployeeByID, Target } from 'src/app/shared/interfaces/employee.interface';
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

  getPresaleEngineers(): Observable<getEmployee[]> {
    return this.http.get<getEmployee[]>(`${this.api}/employee/presale-engineers`)
  }
  
  getPresaleManagers(): Observable<getEmployee[]> {
    return this.http.get<getEmployee[]>(`${this.api}/employee/presale-managers`)
  }

  getEmployees(filterData: FilterEmployee): Observable<{ total: number, employees: getEmployee[] }> {
    return this.http.post<{ total: number, employees: getEmployee[] }>(`${this.api}/employee/get`, filterData)
  }

  getEmployeesForCustomerTransfer(customerId: string): Observable<getEmployee[]> {
    return combineLatest([this.employeeData$]).pipe(
      filter(([employee]) => !!employee), // Ensure the employee data is defined
      switchMap(([employee]) =>
        this.http.get<getEmployee[]>(`${this.api}/employee/no-customer-access/${customerId}/${employee!._id}`).pipe(
          catchError(error => {
            console.error('Error fetching employees for customer transfer:', error);
            throw error;
          })
        )
      )
    );
  }

  createEmployees(employeeData: CreateEmployee): Observable<getEmployee> {
    return this.http.post<getEmployee>(`${this.api}/employee`, employeeData)
  }

  changePasswordOfEmployee(passwords: object) {
    return this.http.patch(`${this.api}/employee/changePassword`, passwords)
  }

  editEmployees(employeeData: CreateEmployee): Observable<getEmployee> {
    return this.http.patch<getEmployee>(`${this.api}/employee/edit`, employeeData)
  }

  setTarget(tagetValues: Target, userId?: string): Observable<Target[]> {
    return this.http.patch<Target[]>(`${this.api}/employee/setTarget/${userId}`, tagetValues)
  }

  updateTarget(tagetValues: Target, id: string, userId?: string): Observable<Target[]> {
    return this.http.patch<Target[]>(`${this.api}/employee/update-target/${userId}/${id}`, tagetValues)
  }

  createCategory(categroyData: GetCategory) {
    return this.http.post(`${this.api}/category`, categroyData)
  }

  updateCategory(categroyData: GetCategory, categoryId?: string) {
    return this.http.patch(`${this.api}/category/${categoryId}`, categroyData)
  }

  getCategory(): Observable<GetCategory[]> {
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

  isEmployeePresent(): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.api}/employee/check`)
  }

  getEmployeeByEmployeeId(employeeId: string, access?: string, userId?: string): Observable<getEmployeeByID> {
    return this.http.get<getEmployeeByID>(`${this.api}/employee/view/get/${employeeId}?access=${access}&userId=${userId}`)
  }

  getEmployeeData(id: string) {
    this.getEmployee(id).subscribe(
      (employeeData: getEmployee) => {
        this.employeeSubject.next(employeeData);
      }
    );
  }

  deleteCategory(data: { dataId: string, employee: string }): Observable<any> {
    return this.http.post<any>(`${this.api}/category/delete`, data);
  }

  deleteEmployee(data: { dataId: string, employeeId: string }): Observable<any> {
    return this.http.post<any>(`${this.api}/employee/delete`, data);
  }
}
