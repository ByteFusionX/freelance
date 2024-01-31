import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { FilterQuote, QuoteStatus, getQuotation, Quotatation } from 'src/app/shared/interfaces/quotation.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {

  api: string = environment.api
  constructor(private http: HttpClient) { }

  saveQuotation(quotationDetails: Quotatation): Observable<Quotatation> {
    return this.http.post<Quotatation>(`${this.api}/quotation`, quotationDetails)
  }

  updateQuotation(quotationDetails: Quotatation, quoteId: string | undefined): Observable<Quotatation> {
    return this.http.patch<Quotatation>(`${this.api}/quotation/update/${quoteId}`, quotationDetails)
  }

  getQuotation(filterData:FilterQuote): Observable<getQuotation> {
    return this.http.post<getQuotation>(`${this.api}/quotation/get`,filterData)
  }

  updateQuoteStatus(quoteId: string, status: QuoteStatus): Observable<string> {
    return this.http.patch<string>(`${this.api}/quotation/status/${quoteId}`, { status })
  }

  totalQuotations(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.api}/quotation/total`)
  }

  uploadLpo(lpoData:FormData):Observable<any>{
    return this.http.post<any>(`${this.api}/quotation/lpo`,lpoData)
  }
}
