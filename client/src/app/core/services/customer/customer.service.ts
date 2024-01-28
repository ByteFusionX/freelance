import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private http: HttpClient) { }
  readonly apiUrl = environment.api

  createCustomer(data: getCustomer): Observable<getCustomer> {
    return this.http.post<getCustomer>(`${this.apiUrl}/customer`, data)
  }

  getCustomers(): Observable<getCustomer[]> {
    return this.http.get<getCustomer[]>(`${this.apiUrl}/customer`)
  }

}
