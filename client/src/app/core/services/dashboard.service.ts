import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, filter } from 'rxjs';
import { Filters, Metric } from 'src/app/shared/interfaces/dasbhoard.interface';

import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    constructor(private http: HttpClient) { }
    apiUrl = environment.api

    getDashboardMetrics(userId: any, filter: Filters): Observable<Metric[]> {
        return this.http.post<Metric[]>(`${this.apiUrl}/dashboard/metrics`, { userId, filter })
    }

}
