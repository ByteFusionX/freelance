import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { getEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { saveAs } from 'file-saver'
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { HttpEventType } from '@angular/common/http';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-assigned-jobs-list',
  templateUrl: './assigned-jobs-list.component.html',
  styleUrls: ['./assigned-jobs-list.component.css']
})
export class AssignedJobsListComponent implements OnInit, OnDestroy {

  @ViewChild('fileInput') fileInput!: ElementRef;
  displayedColumns: string[] = ['enqId', 'customerName', 'description', 'assignedBy', 'department', 'download', 'upload', 'send'];
  dataSource = new MatTableDataSource<getEnquiry>();
  isLoading: boolean = true;
  isEmpty: boolean = false
  subscriptions = new Subscription()

  page: number = 1;
  row: number = 10;
  total!: number;
  subject = new BehaviorSubject<{ page: number, row: number }>({ page: 1, row: 10 })

  progress: number = 0
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
      this.getJobsData()
    })
  }

  getJobsData() {
    let access;
    let userId;
    this._employeeService.employeeData$.subscribe((employee) => {
      access = employee?.category.privileges.assignedJob.viewReport
      userId = employee?._id
    })

    this.subscriptions.add(
      this._enquiryService.getPresale(this.page, this.row, access, userId).subscribe({
        next: (data) => {
          this.dataSource.data = data.enquiry;
          this.total = data.total;
          this.isLoading = false;
        },
        error: (error) => {
          this.isEmpty = true
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  onSendClicked(index: number) {
    const dialogRef = this._dialog.open(ConfirmationDialogComponent,
      {
        data: {
          title: `Are you absolutely sure?`,
          description: `This action is irreversible and send the assigned task back to the salesperson. Please ensure all files are selected before proceeding.`,
          icon: 'heroExclamationCircle',
          IconColor: 'orange'
        }
      });

    dialogRef.afterClosed().subscribe((approved: boolean) => {
      if (approved) {
        let selectedEnquiry: { id: string, status: string } = {
          id: this.dataSource.data[index]._id,
          status: 'Work In Progress'
        }
        Object.seal(selectedEnquiry)
        this.subscriptions.add(
          this._enquiryService.updateEnquiryStatus(selectedEnquiry).subscribe((data) => {
            if (data) {
              this.dataSource.data.splice(index, 1)
              if (this.dataSource.data.length) {
                this.dataSource.data = [...this.dataSource.data]
              } else {
                this.dataSource.data = []
                this.isEmpty = true
              }
              this.toast.success('Enquiry send successfully')
            }
          })
        )
      }
    })
  }

  onUploadClicks(index: number) {
    let dialog = this._dialog.open(FileUploadComponent, {
      width: '500px',
      data: this.dataSource.data[index]._id
    })
    dialog.afterClosed().subscribe((data) => {
      if (data) {
        data.client = [data.client]
        data.department = [data.department]
        data.salesPerson = [data.salesPerson]
        this.dataSource.data[index] = data
        this.dataSource.data = [...this.dataSource.data]
      }
    })
  }

  onDateChange(event: { page: number, row: number }) {
    this.subject.next(event)
  }

  onClearFiles(index: number) {
    this.dataSource.data[index].preSale.presaleFile = null;

    const enquiryId = this.dataSource.data[index]._id;
    this._enquiryService.clearAllPresaleFiles(enquiryId)
      .subscribe({
        next: (event) => {
          this.dataSource.data[index].assignedFiles = [];
        },
        error: (error) => {
          if (error.status == 404) {
            this.toast.warning('Something went wrong')
          }
        }
      })
  }

  onRemoveItem(event: Event, index: number, file: any) {
    event.stopPropagation()

    const enquiry = this.dataSource.data[index];
    const enquiryId = enquiry._id;
    const fileName = file.filename;

    this._enquiryService.deleteFile(fileName, enquiryId)
      .subscribe({
        next: (event) => {
          this.dataSource.data[index].assignedFiles = enquiry.assignedFiles.filter((data) => {
            return data.filename !== fileName
          })
        },
        error: (error) => {
          this.toast.warning('Sorry, The requested file was not found on the server. Please ensure that the file exists and try again.')
        }
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

  clearProgress() {
    setTimeout(() => {
      this.selectedFile = undefined;
      this.progress = 0
    }, 1000)
  }

  handleNotClose(event: MouseEvent) {
    event.stopPropagation();
  }
  chooseType(file: any): string {
    const contentTypes: any = {
      'pdf': 'application/pdf',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
    const extension: string = <string>file.split('.').pop().toLowerCase();
    return contentTypes[extension]
  }

}

