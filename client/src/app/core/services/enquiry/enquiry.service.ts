import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Enquiry, EnquiryTable, FeedbackTable, FilterEnquiry, MonthlyEnquiry, TotalEnquiry, getEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {

  readonly api: string = environment.api
  quoteSubject = new BehaviorSubject<getEnquiry | undefined>(undefined)
  enquiryData$ = this.quoteSubject.asObservable()

  depSubject = new BehaviorSubject<string | null>(null)
  departmentData$ = this.depSubject.asObservable()
  constructor(private http: HttpClient) { }

  createEnquiry(formData: FormData): Observable<getEnquiry> {
    return this.http.post<getEnquiry>(`${this.api}/enquiry/create`, formData)
  }

  assignPresale(formData: FormData,enquiryId:string): Observable<{success:boolean}> {
    return this.http.patch<{success:boolean}>(`${this.api}/enquiry/presales/${enquiryId}`, formData)
  }

  getEnquiry(filterData: FilterEnquiry): Observable<EnquiryTable> {
    return this.http.post<EnquiryTable>(`${this.api}/enquiry/get`, filterData)
  }

  getPresale(page: number, row: number,filter:string,access?:string,userId?:string): Observable<EnquiryTable> {
    return this.http.get<EnquiryTable>(`${this.api}/enquiry/presales?filter=${filter}&page=${page}&row=${row}&access=${access}&userId=${userId}`)
  }

  updateEnquiryStatus(selectedEnquiry: { id: string, status: string }): Observable<getEnquiry> {
    return this.http.put<getEnquiry>(`${this.api}/enquiry/update`, selectedEnquiry)
  }

  emitToQuote(enquiry: getEnquiry | undefined) {
    this.quoteSubject.next(enquiry)
  }

  totalEnquiries(access?:string,userId?:string): Observable<TotalEnquiry[]> {
    return this.http.get<TotalEnquiry[]>(`${this.api}/enquiry/sum?access=${access}&userId=${userId}`)
  }

  monthlyEnquiries(access?:string,userId?:string): Observable<MonthlyEnquiry[]> {
    return this.http.get<MonthlyEnquiry[]>(`${this.api}/enquiry/monthly?access=${access}&userId=${userId}`)
  }

  selectedDepartment(departmentId: string) {
    this.depSubject.next(departmentId)
}

  uploadAssignedFiles(formData: FormData): Observable<getEnquiry> {
    return this.http.post<getEnquiry>(`${this.api}/enquiry/assign-files`, formData)
  }

  downloadFile(fileName: string): Observable<any> {
    return this.http.get(`${this.api}/file/download?file=${fileName}`,
      { responseType: 'blob', observe: 'events', reportProgress: true })
  }

  getFile(fileName: string): Observable<any> {
    return this.http.get(`${this.api}/file/${fileName}`, { responseType: 'blob' })
  }

  deleteFile(fileName: string, enquiryId: string) {
    return this.http.delete(`${this.api}/file`, { params: { file: fileName, enquiryId: enquiryId } });
  }
  
  clearAllPresaleFiles(enquiryId:string){
    return this.http.delete(`${this.api}/file/clearAll?enquiryId=${enquiryId}`)
  }

  sendFeedbackRequest(feedbackBody:{enquiryId:string,employeeId:string}){
    return this.http.patch(`${this.api}/enquiry/feedback-request`,feedbackBody)
  }

  getFeedbackRequests(page: number, row: number,employeeId?:string): Observable<FeedbackTable> {
    return this.http.get<FeedbackTable>(`${this.api}/enquiry/feedback-request/${employeeId}?page=${page}&row=${row}`)
  }

  giveFeedback(feedbackBody:{enquiryId:string,feedback:string}){
    return this.http.patch(`${this.api}/enquiry/give-feedback`,feedbackBody)
  }

  sendRevision(revisionComment:string,enquiryId:string){
    return this.http.patch(`${this.api}/enquiry/revision/${enquiryId}`,{revisionComment})
  }

  presalesCounts(access?: string, userId?: string): Observable<{ pending: number, completed: number }> {
    return this.http.get<{ pending: number, completed: number }>(`${this.api}/enquiry/presales/count?access=${access}&userId=${userId}`)
  }

  
}
