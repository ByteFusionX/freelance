import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterCustomer, getCustomer, getFilteredCustomer } from 'src/app/shared/interfaces/customer.interface';
import { getCreators, getEmployee } from 'src/app/shared/interfaces/employee.interface';
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

  getAllCustomers(): Observable<getCustomer[]> {
    return this.http.get<getCustomer[]>(`${this.apiUrl}/customer`)
  }

  getCustomerCreators(): Observable<getCreators[]> {
    return this.http.get<getCreators[]>(`${this.apiUrl}/customer/creators`)
  }

  getCustomers(filterData: FilterCustomer): Observable<getFilteredCustomer> {
    return this.http.post<getFilteredCustomer>(`${this.apiUrl}/customer/get`, filterData)
  }

  

}
