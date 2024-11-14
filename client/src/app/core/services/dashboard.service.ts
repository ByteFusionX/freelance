import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, filter } from 'rxjs';
import { Filters, Metric, ProfitPerMonth, RevenuePerPerson, SalesConversion } from 'src/app/shared/interfaces/dasbhoard.interface';
import { RangeTarget } from 'src/app/shared/interfaces/employee.interface';

import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    apiUrl = environment.api

    private gaugeChartSubject = new BehaviorSubject<{
        targetValue: number;
        criticalRange: number;
        moderateRange: number;
        companyRevenue: number;
      }>({
        targetValue: 0,
        criticalRange: 0,
        moderateRange: 0,
        companyRevenue: 0,
      });
    guageChart$ = this.gaugeChartSubject.asObservable();

    private donutChartSubject = new Subject<{ name: string, value: number }[]>();
    donutChart$ = this.donutChartSubject.asObservable();

    private graphChartSubject = new BehaviorSubject<{ profitPerMonths: ProfitPerMonth, profitTarget: RangeTarget }>({profitPerMonths: {months:[],profits:[]}, profitTarget: {criticalRange:0,moderateRange:0,targetValue:0}});
    graphChart$ = this.graphChartSubject.asObservable();

    private enquiryConvesionSubject = new Subject<SalesConversion>();
    enquiryConvesion$ = this.enquiryConvesionSubject.asObservable();

    private presalesConvesionSubject = new Subject<SalesConversion>();
    presaleConvesion$ = this.presalesConvesionSubject.asObservable();

    constructor(private http: HttpClient) { }

    getDashboardMetrics(userId: any, filters: Filters): Observable<Metric[]> {
        return this.http.post<Metric[]>(`${this.apiUrl}/dashboard/metrics`, { userId, filters })
    }

    getRevenuePerSalesperson(userId: any, filters: Filters): Observable<RevenuePerPerson[]> {
        return this.http.post<RevenuePerPerson[]>(`${this.apiUrl}/dashboard/revenueperperson`, { userId, filters })
    }

    getGrossProfitForLastSevenMonths(userId: any, filters: Filters): Observable<ProfitPerMonth> {
        return this.http.post<ProfitPerMonth>(`${this.apiUrl}/dashboard/grossProfitForLastSevenMonths`, { userId, filters })
    }

    getEnquirySalesConversion(userId: any, filters: Filters): Observable<SalesConversion> {
        return this.http.post<SalesConversion>(`${this.apiUrl}/dashboard/enquirySalesConversion`, { userId, filters })
    }

    getPresaleJobSalesConversion(userId: any, filters: Filters): Observable<SalesConversion> {
        return this.http.post<SalesConversion>(`${this.apiUrl}/dashboard/presaleSalesConversion`, { userId, filters })
    }

    updateGuageChart(updatedValues: { targetValue?: number, badRange?: number, moderateRange?: number, companyRevenue?: number }) {
        const newValue = {
            ...this.gaugeChartSubject.getValue(),
            ...updatedValues
        };
        this.gaugeChartSubject.next(newValue)
    }

    updateDonutChart(data: { name: string, value: number }[]) {
        this.donutChartSubject.next(data)
    }

    updateGraphChart(data: { profitPerMonths?: ProfitPerMonth, profitTarget?: RangeTarget }) {
        const newValue = {
            ...this.graphChartSubject.getValue(),
            ...data
        };
        this.graphChartSubject.next(newValue)
    }

    updateEnquiryConversions(data: SalesConversion) {
        this.enquiryConvesionSubject.next(data)
    }

    updatePresaleConversions(data: SalesConversion) {
        this.presalesConvesionSubject.next(data)
    }


}
