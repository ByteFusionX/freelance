import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Department } from './profile.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  api: string = environment.api
  constructor(private http: HttpClient) { }

  getDepartments(): Observable<Department> {
    return this.http.get<Department>(`${this.api}/department`)
  }

  setDepartment(department: Department): Observable<any> {
    return this.http.post(`${this.api}/department`, department)
  }
}
