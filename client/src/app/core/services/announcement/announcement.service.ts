import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { announcementData } from './announcement.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  constructor(private http: HttpClient) { }
  readonly apiUrl = environment.api
  createAnnouncement(data: announcementData): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/addAcnnouncement`, data)
  }

}
