// announcement.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { announcementGetData, announcementPostData } from 'src/app/shared/interfaces/announcement.interface';
import { environment } from 'src/environments/environment';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  constructor(private http: HttpClient, private socket: Socket) { }

  readonly apiUrl = environment.api;

  createAnnouncement(data: announcementPostData,): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/announcement/addAnnouncement`, data);
  }

  getAnnouncement(page: number, row: number): Observable<{ total: number, announcements: announcementGetData[] }> {
    return this.http.get<{ total: number, announcements: announcementGetData[] }>(`${this.apiUrl}/announcement/getAnnouncement?page=${page}&row=${row}`);
  }

  markAsViewed(announcementId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/announcement/markAsViewed`, { announcementId, userId });
  }

  getNewAnnouncements(): Observable<any> {
    return this.socket.fromEvent('notViewed');
  }

  onCheckNotViewed(userId: string) {
    this.socket.emit('onCheck', userId)
  }


}
