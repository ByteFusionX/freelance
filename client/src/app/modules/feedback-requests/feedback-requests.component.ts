import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { getEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { ViewCommentComponent } from '../assigned-jobs/pages/view-comment/view-comment.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { saveAs } from 'file-saver'
import { GiveFeedbackComponent } from './pages/give-feedback/give-feedback.component';


@Component({
  selector: 'app-feedback-requests',
  templateUrl: './feedback-requests.component.html',
  styleUrls: ['./feedback-requests.component.css']
})
export class FeedbackRequestsComponent {
  isLoading: boolean = true;
  isEmpty: boolean = false;
  subscriptions = new Subscription()

  dataSource = new MatTableDataSource<getEnquiry>();
  displayedColumns: string[] = ['enqId', 'customerName', 'description', 'assignedBy', 'department', 'comment', 'download', 'requestedBy', 'presaleFile', 'reply'];

  page: number = 1;
  row: number = 10;
  total!: number;
  subject = new BehaviorSubject<{ page: number, row: number }>({ page: 1, row: 10 })

  progress: number = 0;
  selectedFile!: string | undefined;

  constructor(
    private _enquiryService: EnquiryService,
    private _dialog: MatDialog,
    private toast: ToastrService,
    private _employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.subject.subscribe((data) => {
      this.page = data.page
      this.row = data.row
      this.getFeedbackRequests()
    })
  }

  getFeedbackRequests() {
    this.isLoading = true;
    this._employeeService.employeeData$.subscribe((employee) => {
      const employeeId = employee?._id;
      if (employeeId) {
        this.subscriptions.add(
          this._enquiryService.getFeedbackRequests(this.page, this.row, employeeId).subscribe({
            next: (data) => {
              console.log(data);
              this.dataSource.data = data.feedbacks;
              this.total = data.total;
              this.isLoading = false;
              this.isEmpty = false;
            },
            error: (error) => {
              this.isEmpty = true;
              this.isLoading = false;
            }
          })
        );
      } else {        
        this.isLoading = false;
        this.isEmpty = true;
      }
    });
  }
  


  onViewComment(comment: string) {
    let dialog = this._dialog.open(ViewCommentComponent, {
      width: '500px',
      data: comment
    })
  }

  onDownloadClicks(file: any) {
    this.selectedFile = file.filename
    this.subscriptions.add(
      this._enquiryService.downloadFile(file.filename)
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

  onGiveFeedback(enquiryId: string, index: number) {
    let dialog = this._dialog.open(GiveFeedbackComponent, {
      width: '500px',
    })

    dialog.afterClosed().subscribe((feedback: string) => {
      if (feedback) {
        const feedbackBody = { enquiryId, feedback }
        this._enquiryService.giveFeedback(feedbackBody).subscribe((res: any) => {
          if (res.success) {
            this.dataSource.data.splice(index, 1);
            this.dataSource._updateChangeSubscription();
            if(this.dataSource.data.length == 0){
              this.isEmpty = true;
            }
          }
        })
      }
    })
  }

  onDateChange(event: { page: number, row: number }) {
    this.subject.next(event)
  }

  clearProgress() {
    setTimeout(() => {
      this.selectedFile = undefined;
      this.progress = 0
    }, 1000)
  }
}