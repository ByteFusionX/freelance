import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Department } from './profile.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  apiUrl: string = environment.apiUrl
  constructor(private http: HttpClient) {}

  setDepartment(department: Department): void {
    this.http.post(`${this.apiUrl}/department`, department)
  }

  getDepartments(): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/department/getAll`)
  }
}
