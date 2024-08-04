import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Department, getDepartment } from 'src/app/shared/interfaces/department.interface';
import { NoteDelete, NotePatch, NotePost, Notes } from 'src/app/shared/interfaces/notes.interface';
import { TotalEnquiry } from 'src/app/shared/interfaces/enquiry.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  readonly api: string = environment.api
  constructor(private http: HttpClient) { }

  getDepartments(): Observable<getDepartment[]> {
    return this.http.get<getDepartment[]>(`${this.api}/department`)
  }

  setDepartment(department: Department): Observable<getDepartment> {
    return this.http.post<getDepartment>(`${this.api}/department`, department)
  }

  updateDepartment(department: Department): Observable<getDepartment> {
    return this.http.put<getDepartment>(`${this.api}/department`, department)
  }

  totalEnquiries(access?: string, userId?: string): Observable<TotalEnquiry[]> {
    return this.http.get<TotalEnquiry[]>(`${this.api}/department/enquiry-count?access=${access}&userId=${userId}`)
  }

  getNotes(): Observable<Notes> {
    return this.http.get<Notes>(`${this.api}/note`)
  }

  createCustomerNote(note:NotePost):Observable<Notes>{
    return this.http.post<Notes>(`${this.api}/note/customerNote`, note)
  }

  createTermsAndCondition(note:NotePost):Observable<Notes>{
    return this.http.post<Notes>(`${this.api}/note/termsCondition`, note)
  }

  updateNote(note:NotePatch,noteId:string):Observable<Notes>{
    return this.http.patch<Notes>(`${this.api}/note/${noteId}`, note)
  }

  deleteNote(noteType:string,noteId:string):Observable<any>{
    return this.http.delete<any>(`${this.api}/note/${noteId}/${noteType}`)
  }

}
