import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { announcementGetData, announcementPostData } from 'src/app/shared/interfaces/announcement.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  constructor(private http: HttpClient) { }
  readonly apiUrl = environment.api
  createAnnouncement(data: announcementPostData): Observable<boolean> { 
    return this.http.post<boolean>(`${this.apiUrl}/announcement/addAcnnouncement`, data)
  }

  getAnnouncment():Observable<announcementGetData[]>{
    return this.http.get<announcementGetData[]>(`${this.apiUrl}/announcement/getAcnnouncement`)
  }


}
