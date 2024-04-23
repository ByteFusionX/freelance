import { HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Observable, Subscription, catchError, tap, throwError } from 'rxjs';
import { JobService } from 'src/app/core/services/job/job.service';
import { JobStatus, JobTable, getJob } from 'src/app/shared/interfaces/job.interface';
import { saveAs } from 'file-saver'
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { GeneratePdfReport } from 'src/app/core/services/generateReport.service';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent {

  selectedDateFormat: string = "monthly";
  selectedFile!: string | undefined;
  progress: number = 0
  reportDate: string = '';

  lastStatus!: JobStatus;
  jobStatuses = Object.values(JobStatus);

  total: number = 0;
  page: number = 1;
  row: number = 10;

  private subject = new BehaviorSubject<{ page: number, row: number }>({ page: this.page, row: this.row });

  jobId: string | null = null

  dataSource = new MatTableDataSource<getJob>()
  filteredData = new MatTableDataSource<getJob>()

  isLoading: boolean = true;
  isEmpty: boolean = false;


  private subscriptions = new Subscription();


  constructor(private _jobService: JobService,
    private toast: ToastrService,
    private _dialog: MatDialog,
    private _fb: FormBuilder,
    private _generatePdfSerive: GeneratePdfReport,
    private _employeeService: EmployeeService,
  ) { }


  ngOnInit() {
    this.getAllJobs()
  }

  selectedStatus!: number;

  formData = this._fb.group({
    fromDate: new FormControl(),
    toDate: new FormControl(),
  })

  status: { value: string }[] = [
    { value: 'Work In Progress' },
    { value: 'Delivered' },
    { value: 'Partially Delivered' },
    { value: 'Completed' },
    { value: 'Cancelled' },
    { value: 'On Hold' },
    { value: 'Invoiced' }

  ];

  onfilterApplied() {
    this.getAllJobs()
  }

  displayedColumns: string[] = ['jobId', 'customerName', 'description', 'salesPersonName', 'department', 'quotations', 'lpo', 'lpoValue', 'status'];

  getAllJobs(selectedMonth?: number, selectedYear?: number) {
    this.isLoading = true;

    let access;
    let userId;
    this._employeeService.employeeData$.subscribe((employee) => {
      access = employee?.category.privileges.jobSheet.viewReport
      userId = employee?._id
    })
    let filterData = {
      page: this.page,
      row: this.row,
      status: this.selectedStatus,
      selectedMonth: selectedMonth,
      selectedYear: selectedYear,
      access: access,
      userId: userId
    }
    this.subscriptions.add(
      this._jobService.getJobs(filterData).subscribe({
        next: (data: JobTable) => {
          this.dataSource.data = [...data.job];
          this.filteredData.data = data.job;
          this.total = data.total;
          this.isEmpty = false;
          this.isLoading = false;
        },
        error: ((error) => {
          if (error.status == 504) this.jobId = '000'
          this.dataSource.data = []
          this.isLoading = false;
          this.isEmpty = true;
        })
      })
    )

  }

  handleNotClose(event: MouseEvent) {
    event.stopPropagation();
  }

  onDownloadClicks(file: any) {
    this.selectedFile = file.filename
    this.subscriptions.add(
      this._jobService.downloadFile(file.filename)
        .subscribe({
          next: (event) => {
            if (event.type === HttpEventType.DownloadProgress) {
              this.progress = Math.round(100 * event.loaded / event.total);
            } else if (event.type === HttpEventType.Response) {
              const fileContent: Blob = new Blob([event['body']])
              saveAs(fileContent, file.originalname)
              this.clearProgress()
            }
          },
          error: (error) => {
            if (error.status == 404) {
              this.selectedFile = undefined
              this.toast.warning('Sorry, The requested file was not found on the server. Please ensure that the file exists and try again.')
            }
          }
        })
    )
  }

  clearProgress() {
    setTimeout(() => {
      this.selectedFile = undefined;
      this.progress = 0
    }, 1000)
  }

  onGenerateReport() {
    this.getAllJobs()
  }

  onStatus(event: Event, status: JobStatus) {
    event.stopPropagation()
    this.lastStatus = status
  }

  updateStatus(i: number, jobId: string, status: JobStatus) {
    this.dataSource.data[i].status = this.lastStatus;
    this.filteredData.data[i].status = this.lastStatus;

    const dialogRef = this._dialog.open(ConfirmationDialogComponent,
      {
        data: {
          title: `Are you absolutely sure?`,
          description: `This action cannot be undone. This will permanently change the status to ${status}.`,
          icon: 'heroExclamationCircle',
          IconColor: 'orange'
        }
      });

    dialogRef.afterClosed().subscribe((approved: boolean) => {
      if (approved) {
        this._jobService.updateJobStatus(jobId, status).subscribe((res: JobStatus) => {
          this.dataSource.data[i].status = res;
          this.filteredData.data[i].status = res;
        })
      }
    })
  }

  filteredStatuses(selectedStatus: string): JobStatus[] {
    const allStatuses = Object.values(JobStatus);
    let filteredStatuses: JobStatus[] = [];

    let statusReached = false;

    allStatuses.forEach((status) => {
      if (status === selectedStatus) {
        statusReached = true;
      }
      if (statusReached) {
        filteredStatuses.push(status);
      }
    });

    return filteredStatuses;
  }

  generatePdf(dateRange: { selectedMonth?: number, selectedYear: number, selectedMonthName?: string }) {
    if (dateRange.selectedMonth && dateRange.selectedYear) {
      this.getJobsForPdf(dateRange.selectedMonth, dateRange.selectedYear).subscribe(() => {
        this.reportDate = `${dateRange.selectedMonthName} - ${dateRange.selectedYear}`;
        this.generatePdfAfterDataFetch();
      });
    } else {
      this.getJobsForPdf(undefined, dateRange.selectedYear).subscribe(() => {
        this.reportDate = `${dateRange.selectedYear}`;
        this.generatePdfAfterDataFetch();
      });
    }
  }
  
  getJobsForPdf(selectedMonth?: number, selectedYear?: number): Observable<JobTable> {
    this.isLoading = true;
    let filterData = {
      page: this.page,
      row: this.row,
      status: this.selectedStatus,
      selectedMonth: selectedMonth,
      selectedYear: selectedYear
    };
  
    return this._jobService.getJobs(filterData).pipe(
      tap((data: JobTable) => {
        this.dataSource.data = [...data.job];
        this.filteredData.data = data.job;
        this.total = data.total;
        this.isEmpty = false;
        this.isLoading = false;
      }),
      catchError((error) => {
        if (error.status == 504) {
          this.jobId = '000';
        }
        this.dataSource.data = [];
        this.isLoading = false;
        this.isEmpty = true;
        return throwError(error);
      })
    );
  }
  
  generatePdfAfterDataFetch() {
    if (!this.isEmpty) {
      const tableHeader: string[] = ['JobId', 'Customer', 'Description', 'Sales Person', 'Department', 'Quote', 'LPO Val.', 'Status'];
      const tableData = this.dataSource.data.map((data: any) => {
        return [
          data.jobId,
          data.clientDetails[0].companyName,
          data.quotation[0].subject,
          `${data.salesPersonDetails[0].firstName} ${data.salesPersonDetails[0].lastName}`,
          data.departmentDetails[0].departmentName,
          data.quotation[0].quoteId,
          data.lpoValue,
          data.status
        ];
      });
      const width = ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', 'auto'];
      this._generatePdfSerive.generatePdf('Job Report', this.reportDate, tableData, tableHeader, width);
    } else {
      this.toast.warning('No Data to generate Report');
    }
  }
  

  onRemoveReport() {
    this.reportDate = ''
    this.getAllJobs()
  }


  onPageNumberClick(event: { page: number, row: number }) {
    this.subject.next(event)
  }

}
