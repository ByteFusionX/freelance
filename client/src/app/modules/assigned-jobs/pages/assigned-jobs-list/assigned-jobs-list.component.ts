import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { getEnquiry } from 'src/app/shared/interfaces/enquiry.interface';

@Component({
  selector: 'app-assigned-jobs-list',
  templateUrl: './assigned-jobs-list.component.html',
  styleUrls: ['./assigned-jobs-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AssignedJobsListComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;
  displayedColumns: string[] = ['enqId', 'customerName', 'description', 'assignedBy', 'department', 'download', 'upload', 'send'];
  dataSource = new MatTableDataSource<getEnquiry>();
  isLoading: boolean = true;

  selectedDocs: File[] = []

  constructor(private _enquiryService: EnquiryService) { }

  ngOnInit(): void {
    this._enquiryService.getPresale().subscribe((data) => {
      if (data) {
        this.dataSource.data = data
        this.isLoading = false
      }
    })
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

  onFileRemoved(index: number) {
    this.selectedDocs.splice(index, 1)
    this.fileInput.nativeElement.value = '';
  }
}
