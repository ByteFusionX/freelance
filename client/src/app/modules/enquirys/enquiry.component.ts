import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEnquiryDialog } from './create-enquiry/create-enquiry.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { Observable } from 'rxjs';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-enquiry',
  templateUrl: './enquiry.component.html',
  styleUrls: ['./enquiry.component.css']
})
export class EnquiryComponent implements OnInit {

  constructor(
    public dialog: MatDialog, 
    private _fb: FormBuilder,
    private _employeeService:EmployeeService) { }

  selectedSalesPerson!: number;;
  selectedStatus!: number;
  submit: boolean = false
  dateError: boolean = false

  salesPerson$!: Observable<getEmployee[]>;

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

  ngOnInit(): void {
     this.salesPerson$ = this._employeeService.getEmployees()
  }

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
