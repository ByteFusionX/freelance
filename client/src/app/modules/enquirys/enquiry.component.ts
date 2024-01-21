import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEnquiryDialog } from './create-enquiry/create-enquiry.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { getEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enquiry',
  templateUrl: './enquiry.component.html',
  styleUrls: ['./enquiry.component.css'],
})
export class EnquiryComponent implements OnInit {

  selectedSalesPerson!: string;
  selectedStatus!: string;
  submit: boolean = false
  enqId!: string;
  salesPerson$!: Observable<getEmployee[]>;
  isLoading: boolean = true;
  isEmpty: boolean = false
  status: { name: string }[] = [{ name: 'Work In Progress' }, { name: 'Assigned To Presales' }];
  displayedColumns: string[] = ['enquiryId', 'customerName', 'enquiryDescription', 'salesPersonName', 'department', 'status'];
  dataSource = new MatTableDataSource<getEnquiry>()
  filteredData = new MatTableDataSource<getEnquiry>()
  total!: number;
  page: number = 1
  row: number = 10
  private subscriptions = new Subscription()
  private subject = new BehaviorSubject<{ page: number, row: number }>({ page: this.page, row: this.row })

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private _employeeService: EmployeeService,
    private _enquiryService: EnquiryService,
    private router: Router
  ) { }

  formData = this.fb.group({
    fromDate: new FormControl(),
    toDate: new FormControl(),
  })

  ngOnInit(): void {
    this.salesPerson$ = this._employeeService.getEmployees()
    this.subject.subscribe((data) => {
      this.page = data.page
      this.row = data.row
      this.getEnquiries(data.page, data.row)
    })
  }

  getEnquiries(page: number, row: number) {
    this.subscriptions.add(
      this._enquiryService.getEnquiry(page, row)
        .subscribe((data) => {
          this.dataSource.data = [...data.enquiry];
          this.filteredData.data = data.enquiry;
          this.total = data.total
          this.isLoading = false
          let length = data.enquiry.length - 1;
          this.enqId = data.enquiry[length].enquiryId.slice(-3);
        }, (error) => {
          this.isEmpty = true
          this.enqId = '000'
        })
    )
  }

  openDialog() {
    const dialogRef = this.dialog.open(CreateEnquiryDialog, { data: this.enqId })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.data = [...this.dataSource.data, result]
        this.enqId = result.enquiryId.slice(-3)
      }
    })
  }

  handleNotClose(event: MouseEvent) {
    event.stopPropagation();
  }

  onSubmit() {
    this.submit = true
    let from = this.formData.controls.fromDate.value
    let to = this.formData.controls.toDate.value
    const current = new Date();
    const today = current.toISOString().split('T')[0]
    if (from <= to && to <= today) {
      this.dataSource.data = this.filteredData.data
      let data = this.dataSource.data.filter((data) => data.date.slice(0, 10) >= from && data.date.slice(0, 10) <= to)
      this.dataSource.data = [...data]
    }
  }

  onfilterApplied() {
    if (!this.selectedSalesPerson || !this.selectedStatus) {
      this.dataSource.data = this.filteredData.data
    }

    if (this.selectedSalesPerson) {
      let data = this.dataSource.data.filter((data) => data.salesPerson._id === this.selectedSalesPerson)
      this.dataSource.data = [...data]
    }

    if (this.selectedStatus) {
      let data = this.dataSource.data.filter((data) => data.status === this.selectedStatus)
      this.dataSource.data = [...data]
    }

    if (this.selectedStatus) {
      let data = this.dataSource.data.filter((data) => data.status === this.selectedStatus)
      this.dataSource.data = [...data]
    }

  }

  onRowClicks(index:number){
    
  }

  onRowClicks(index: number) {
    let enqData = this.dataSource.data[index]
    if (enqData.status != 'Assigned To Presales') {
      this._enquiryService.emitToQuote(enqData)
      this.router.navigate(['/quotations/create'])
    }
  }

  onPageNumberClick(event: { page: number, row: number }) {
    this.subject.next(event)
  }
}
