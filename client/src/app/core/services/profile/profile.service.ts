import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  api: string = environment.api
  constructor(private http: HttpClient) { }

  getDepartments(): Observable<getDepartment[]> {
    return this.http.get<getDepartment[]>(`${this.api}/department`)
  }

  setDepartment(department: getDepartment): Observable<any> {
    return this.http.post(`${this.api}/department`, department)
  }
}
