import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Department, getDepartment } from 'src/app/shared/interfaces/department.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  readonly api: string = environment.api
  constructor(private http: HttpClient) { }

  getDepartments(): Observable<getDepartment[]> {
    return this.http.get<getDepartment[]>(`${this.api}/department`)
  }

  setDepartment(department: Department): Observable<getDepartment> {
    return this.http.post<getDepartment>(`${this.api}/department`, department)
  }

  updateDepartment(department: Department): Observable<getDepartment> {
    return this.http.put<getDepartment>(`${this.api}/department`, department)
  }

}
