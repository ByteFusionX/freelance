import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, filter } from 'rxjs';
import { JobStatus, JobTable, filterJob, getJob } from 'src/app/shared/interfaces/job.interface';
import { QuoteStatus } from 'src/app/shared/interfaces/quotation.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  constructor(private http: HttpClient) { }
 apiUrl = environment.api

  getJobs(filterData:filterJob):Observable<JobTable>{
    return this.http.post<JobTable>(`${this.apiUrl}/job/getJobs`,filterData)
  }

  downloadFile(fileName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/file/download?file=${fileName}`,
      { responseType: 'blob', observe: 'events', reportProgress: true })
  }

  updateJobStatus(jobId: string, status: JobStatus): Observable<JobStatus> {
    console.log("reached service")
    return this.http.patch<JobStatus>(`${this.apiUrl}/job/status/${jobId}`, { status })
  }
}
