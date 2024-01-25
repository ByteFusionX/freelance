import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Enquiry, EnquiryTable, FilterEnquiry, MonthlyEnquiry, TotalEnquiry, getEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {

  api: string = environment.api
  quoteSubject = new BehaviorSubject<getEnquiry | undefined>(undefined)
  enquiryData$ = this.quoteSubject.asObservable()

  depSubject = new BehaviorSubject<string | null>(null)
  departmentData$ = this.depSubject.asObservable()
  constructor(private http: HttpClient) { }

  createEnquiry(enquiry: Partial<Enquiry>): Observable<getEnquiry> {
    return this.http.post<getEnquiry>(`${this.api}/enquiry/create`, enquiry)
  }

  getEnquiry(filterData: FilterEnquiry): Observable<EnquiryTable> {
    return this.http.post<EnquiryTable>(`${this.api}/enquiry/get`, filterData)
  }

  getPresale(page: number, row: number): Observable<EnquiryTable> {
    return this.http.get<EnquiryTable>(`${this.api}/enquiry/presales?page=${page}&row=${row}`)
  }

  updateEnquiryStatus(selectedEnquiry: { id: string, status: string }): Observable<getEnquiry> {
    return this.http.put<getEnquiry>(`${this.api}/enquiry/update`, selectedEnquiry)
  }

  emitToQuote(enquiry: getEnquiry | undefined) {
    this.quoteSubject.next(enquiry)
  }

  totalEnquiries(): Observable<TotalEnquiry[]> {
    return this.http.get<TotalEnquiry[]>(`${this.api}/enquiry/sum`)
  }

  monthlyEnquiries(): Observable<MonthlyEnquiry[]> {
    return this.http.get<MonthlyEnquiry[]>(`${this.api}/enquiry/monthly`)
  }

  selectedDepartment(departmentId: string) {
    this.depSubject.next(departmentId)
  }
}
