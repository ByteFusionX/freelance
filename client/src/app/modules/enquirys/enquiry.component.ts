import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEnquiryDialog } from './create-enquiry/create-enquiry.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { EnquiryTable, getEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-enquiry',
  templateUrl: './enquiry.component.html',
  styleUrls: ['./enquiry.component.css'],
})
export class EnquiryComponent implements OnInit, OnDestroy {

  enqId: string | null = null
  salesPerson$!: Observable<getEmployee[]>;

  isLoading: boolean = true;
  isEmpty: boolean = false;
  isFiltered: boolean = false;
  createEnquiry: boolean | undefined = false;

  status: { name: string }[] = [{ name: 'Work In Progress' }, { name: 'Assigned To Presales' }];
  displayedColumns: string[] = ['enquiryId', 'customerName', 'enquiryDescription', 'salesPersonName', 'department', 'status'];

  dataSource = new MatTableDataSource<getEnquiry>()
  filteredData = new MatTableDataSource<getEnquiry>()

  total: number = 0;
  page: number = 1;
  row: number = 10;
  fromDate: string | null = null
  toDate: string | null = null
  selectedStatus: string | null = null;
  selectedSalesPerson: string | null = null;
  selectedDepartment: string | null = null;

  private subscriptions = new Subscription();
  private subject = new BehaviorSubject<{ page: number, row: number }>({ page: this.page, row: this.row });

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private _employeeService: EmployeeService,
    private _enquiryService: EnquiryService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  formData = this.fb.group({
    fromDate: new FormControl(),
    toDate: new FormControl(),
  })

  ngOnInit(): void {
    this.checkPermission()
    this.salesPerson$ = this._employeeService.getAllEmployees()
    this.subscriptions.add(
      this._enquiryService.departmentData$.subscribe((data) => {
        this.selectedDepartment = data
      })
    )
    this.subscriptions.add(
      this.subject.subscribe((data) => {
        this.page = data.page
        this.row = data.row
        this.getEnquiries()
      })
    )
  }

  ngOnDestroy(): void {
    this._enquiryService.depSubject.next(null)
    this.subscriptions.unsubscribe()
  }

  getEnquiries() {
    this.isLoading = true;
    let access;
    let userId;
    this._employeeService.employeeData$.subscribe((employee) => {
      access = employee?.category.privileges.enquiry.viewReport
      userId = employee?._id
    })

    let filterData = {
      page: this.page,
      row: this.row,
      salesPerson: this.selectedSalesPerson,
      status: this.selectedStatus,
      fromDate: this.fromDate,
      toDate: this.toDate,
      department: this.selectedDepartment,
      access: access,
      userId: userId
    }

    this.subscriptions.add(
      this._enquiryService.getEnquiry(filterData)
        .subscribe({
          next: (data: EnquiryTable) => {
            this.dataSource.data = [...data.enquiry];
            this.filteredData.data = data.enquiry;
            this.total = data.total
            this.isLoading = false
            this.isEmpty = false
            this.enqId = this.total.toString().padStart(3, '0')
          },
          error: ((error) => {
            if (error.status == 504) this.enqId = '000'
            this.dataSource.data = []
            this.isEmpty = true
          })
        })
    )
  }

  openDialog() {
    if (this.enqId) {
      const dialogRef = this.dialog.open(CreateEnquiryDialog, { data: this.enqId })
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.total++
          this.isEmpty = false
          this.isLoading = false
          result.client = result.client
          result.department = result.department
          result.salesPerson = result.salesPerson
          this.dataSource.data = [result, ...this.dataSource.data]
          this.enqId = result.enquiryId.slice(-3)
        }
      })
    }
  }

  onClear() {
    this.isFiltered = false;
    this.fromDate = null
    this.toDate = null
    this.selectedSalesPerson = null;
    this.selectedDepartment = null;
    this.selectedStatus = null;
    this.getEnquiries()
  }

  handleNotClose(event: MouseEvent) {
    event.stopPropagation();
  }

  onSubmit() {
    this.fromDate = null
    this.toDate = null
    let from = this.formData.controls.fromDate.value
    let to = this.formData.controls.toDate.value
    const current = new Date();
    const today = current.toISOString().split('T')[0]
    if (from <= to && to <= today && from.length && to.length) {
      this.fromDate = from
      this.toDate = to
    }
    this.isFiltered = true;
    this.getEnquiries()
  }

  onfilterApplied() {
    this.isFiltered = true;
    this.getEnquiries()
  }

  onRowClicks(index: number) {
    let enqData = this.dataSource.data[index]
    if (enqData.status != 'Assigned To Presales') {
      this._enquiryService.emitToQuote(enqData)
      this.router.navigate(['/quotations/create'])
    }else{
      this.toastr.warning('Enquiry is Assigned to Presales', 'Cannot Quote this Enquiry')
    }
  }

  checkPermission() {
    this._employeeService.employeeData$.subscribe((data) => {
      this.createEnquiry = data?.category.privileges.enquiry.create
    })
  }

  onPageNumberClick(event: { page: number, row: number }) {
    this.subject.next(event)
  }
}
