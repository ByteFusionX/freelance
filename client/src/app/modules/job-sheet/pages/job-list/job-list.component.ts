import { HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { JobService } from 'src/app/core/services/job/job.service';
import { JobStatus, JobTable, getJob } from 'src/app/shared/interfaces/job.interface';
import { saveAs } from 'file-saver'
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent {

  selectedFile!: string | undefined;
  progress: number = 0

  lastStatus!: JobStatus;
  jobStatuses = Object.values(JobStatus);


  page: number = 1;
  row: number = 10;

  jobId: string | null = null


  dataSource = new MatTableDataSource<getJob>()
  filteredData = new MatTableDataSource<getJob>()

  isLoading: boolean = true;
  isEmpty: boolean = false;


  private subscriptions = new Subscription();


  constructor(private _jobService: JobService,
    private toast: ToastrService,
    private _dialog: MatDialog,
  ) { }


  ngOnInit() {
    this.getAllJobs()
  }

  selectedStatus!: number;


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

  displayedColumns: string[] = ['jobId', 'customerName', 'description', 'salesPersonName', 'department', 'lpo', 'quotations', 'lpoValue', 'status'];



  getAllJobs() {
    let filterData = {
      page: this.page,
      row: this.row,
      status: this.selectedStatus,
    }
    this.subscriptions.add(
      this._jobService.getJobs(filterData).subscribe({
        next: (data: JobTable) => {
          this.dataSource.data = [...data.job];
          console.log(this.dataSource.data)
          this.filteredData.data = data.job;
        },
        error: ((error) => {
          if (error.status == 504) this.jobId = '000'
          this.dataSource.data = []
          this.isEmpty = true
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

}
