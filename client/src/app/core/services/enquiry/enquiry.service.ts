import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Enquiry, getEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {

  api: string = environment.api
  quoteSubject = new BehaviorSubject<getEnquiry | undefined>(undefined)
  enquiryData$ = this.quoteSubject.asObservable()
  constructor(private http: HttpClient) { }

  createEnquiry(enquiry: Partial<Enquiry>): Observable<getEnquiry> {
    return this.http.post<getEnquiry>(`${this.api}/enquiry/create`, enquiry)
  }

  getEnquiry(): Observable<getEnquiry[]> {
    return this.http.get<getEnquiry[]>(`${this.api}/enquiry/get`)
  }

  getPresale(): Observable<getEnquiry[]> {
    return this.http.get<getEnquiry[]>(`${this.api}/enquiry/presales`)
  }

  updateEnquiryStatus(selectedEnquiry: { id: string, status: string }): Observable<getEnquiry> {
    return this.http.put<getEnquiry>(`${this.api}/enquiry/update`, selectedEnquiry)
  }

  emitToQuote(enquiry: getEnquiry) {
    this.quoteSubject.next(enquiry)
  }
}
