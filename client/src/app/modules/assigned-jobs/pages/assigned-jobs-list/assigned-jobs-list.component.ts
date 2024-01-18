import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { getEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { FileUploadComponent } from '../file-upload/file-upload.component';

@Component({
  selector: 'app-assigned-jobs-list',
  templateUrl: './assigned-jobs-list.component.html',
  styleUrls: ['./assigned-jobs-list.component.css'],
})
export class AssignedJobsListComponent implements OnInit, OnDestroy {

  @ViewChild('fileInput') fileInput!: ElementRef;
  displayedColumns: string[] = ['enqId', 'customerName', 'description', 'assignedBy', 'department', 'download', 'upload', 'send'];
  dataSource = new MatTableDataSource<getEnquiry>();
  isLoading: boolean = true;

  selectedDocs: File[] = []
  subscriptions = new Subscription()

  constructor(private _enquiryService: EnquiryService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this._enquiryService.getPresale().subscribe((data) => {
        if (data) {
          this.dataSource.data = data
          this.isLoading = false
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  onInputDoc(event: any) {
    let files = event.target.files
    for (let i = 0; i < files.length; i++) {
      const newFile = files[i]
      const exist = this.selectedDocs.some(file => file.name === newFile.name)
      if (!exist) {
        this.selectedDocs.push(files[i])
      }
    }
  }

  onFileRemoved(dataIndex: number, fileIndex: number) {
    this.dataSource.data[dataIndex].preSale.presaleFile.splice(fileIndex, 1)
  }

  onSendClicked(index: number) {
    let selectedEnquiry: { id: string, status: string } = {
      id: this.dataSource.data[index]._id,
      status: 'Work In Progress'
    }
    Object.seal(selectedEnquiry)
    this.subscriptions.add(
      this._enquiryService.updateEnquiryStatus(selectedEnquiry).subscribe((data) => {
        if (data) {
          this.dataSource.data.splice(index, 1)
          this.dataSource.data = [...this.dataSource.data]
        }
      })
    )
  }

  onUploadClicks(index: number) {
    let dialog = this.dialog.open(FileUploadComponent, {
      width: '500px'
    })
    dialog.afterClosed().subscribe((data) => {
      if (data) {
        this.dataSource.data[index].preSale.presaleFile = data
      }
    })
  }
}
