import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { announcementGetData } from 'src/app/shared/interfaces/announcement.interface';
import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class celebCheckService {
    constructor(private http :HttpClient) { }
    readonly apiUrl = environment.api
    
    getCelebrationData():Observable<announcementGetData[]>{
        return this.http.get<announcementGetData[]>(`${this.apiUrl}\celebrationCheck`)
    }
}