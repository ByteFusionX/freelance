import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEnquiryDialog } from './create-enquiry/create-enquiry.component';
import { FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-enquiry',
  templateUrl: './enquiry.component.html',
  styleUrls: ['./enquiry.component.css']
})
export class EnquiryComponent {

  constructor(public dialog: MatDialog, private _fb: FormBuilder) { }

  selectedSalesPerson!: number;;
  selectedStatus!: number;
  submit: boolean = false
  dateError: boolean = false

  salesPerson: { id: number, name: string }[] = [
    { id: 2, name: 'Name1' },
    { id: 5, name: 'Name2' },
    { id: 3, name: 'Name3' },
    { id: 4, name: 'Name4' },
  ];

  status: { id: number, name: string }[] = [
    { id: 1, name: 'Status1' },
    { id: 2, name: 'Status2' },
    { id: 3, name: 'Status3' },
    { id: 4, name: 'Status4' },
  ];

  formData = this._fb.group({
    fromDate: [new FormControl()],
    toDate: [new FormControl()],
  })

  displayedColumns: string[] = ['enquiryId', 'customerName', 'enquiryDescription', 'salesPersonName', 'department', 'status'];

  dataSource = [
    { enquiryId: '1251', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim', department: 'Engineering', status: 'Work in progress' },
    { enquiryId: '1251', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim', department: 'Engineering', status: 'Work in progress' },
    { enquiryId: '1251', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim', department: 'Engineering', status: 'Work in progress' },
    { enquiryId: '1251', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim', department: 'Engineering', status: 'Work in progress' },
    { enquiryId: '1251', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim', department: 'Engineering', status: 'Work in progress' },
    { enquiryId: '1251', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim', department: 'Engineering', status: 'Work in progress' },
    { enquiryId: '1251', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim', department: 'Engineering', status: 'Work in progress' },
    { enquiryId: '1251', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim', department: 'Engineering', status: 'Work in progress' },
    { enquiryId: '1251', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim', department: 'Engineering', status: 'Work in progress' },
    { enquiryId: '1251', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim', department: 'Engineering', status: 'Work in progress' },
    { enquiryId: '1251', customerName: 'shiyas', enquiryDescription: 'enquiry done', salesPersonName: 'basim', department: 'Engineering', status: 'Work in progress' }
  ];

  openDialog() {
    const dialogRef = this.dialog.open(CreateEnquiryDialog)
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
    })
  }

  handleNotClose(event: MouseEvent) {
    event.stopPropagation();
  }

  onSubmit() {
    this.submit = true
    if (this.formData.value.fromDate > this.formData.value.toDate) {
      this.dateError = true
      setTimeout(() => {
        this.dateError = false
      }, 3000);
    } else if (this.formData.value.fromDate < this.formData.value.toDate) {
      this.dateError = false
    } else {

    }
  }
}
