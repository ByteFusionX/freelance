import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { QuoteStatus, quotatation } from 'src/app/shared/interfaces/quotation.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {

  api: string = environment.api
  constructor(private http: HttpClient) { }

  saveQuotation(quotationDetails:quotatation): Observable<quotatation> {
    return this.http.post<quotatation>(`${this.api}/quotation`,quotationDetails)
  }

  updateQuotation(quotationDetails:quotatation,quoteId:string|undefined): Observable<quotatation> {
    return this.http.patch<quotatation>(`${this.api}/quotation/update/${quoteId}`,quotationDetails)
  }

  getQuotation(): Observable<quotatation[]> {
    return this.http.get<quotatation[]>(`${this.api}/quotation`)
  }

  updateQuoteStatus(quoteId:string,status:QuoteStatus): Observable<string> {
    return this.http.patch<string>(`${this.api}/quotation/status/${quoteId}`,{status})
  }
}
