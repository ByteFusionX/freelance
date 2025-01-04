import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  api: string = environment.api
  constructor(private http: HttpClient) { }

  newEvent(formData: FormData): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/events/new-event`, formData)
  }
}
