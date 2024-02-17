import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { getEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { saveAs } from 'file-saver'
import { ToastrService } from 'ngx-toastr';
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
    private dialog: MatDialog,
    private toast: ToastrService) { }

  ngOnInit(): void {
    this.subject.subscribe((data) => {
      this.page = data.page
      this.row = data.row
      this.getJobsData()
    })
  }

  getJobsData() {
    this.subscriptions.add(
      this._enquiryService.getPresale(this.page, this.row).subscribe({
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
    let dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Are you sure?',
        description: 'This action will send the assigned task back to the salesperson. Please confirm that you want to proceed.',
        icon: 'heroExclamationCircle',
        IconColor: 'orange'
      }
    })
    dialog.afterClosed().subscribe((data) => {
      if (data == true) {
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
    let dialog = this.dialog.open(FileUploadComponent, {
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
    this.dataSource.data[index].preSale.presaleFile = null
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

  onOpenClicks(file: { filename: string, originalname: string }) {
    this.subscriptions.add(
      this._enquiryService.getFile(file.filename).subscribe({
        next: (blob) => {
          const contentType = <string>this.chooseType(file.originalname)
          const fileUrl = new Blob([blob], { type: contentType })
          const url = URL.createObjectURL(fileUrl);
          window.open(url);
        },
        error: (error) => {
          this.toast.warning('Sorry, The requested file was not found on the server. Please ensure that the file exists and try again.')
        }
      })
    )
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

