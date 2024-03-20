import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationExtras, Router } from '@angular/router';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { ContactDetail, getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { getQuotation, Quotatation, quotatationForm, QuoteStatus } from 'src/app/shared/interfaces/quotation.interface';
import { UploadLpoComponent } from '../upload-lpo/upload-lpo.component';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-quotation-list',
  templateUrl: './quotation-list.component.html',
  styleUrls: ['./quotation-list.component.css']
})
export class QuotationListComponent {

  customers$!: Observable<getCustomer[]>;
  salesPerson$!: Observable<getEmployee[]>;
  departments$!: Observable<getDepartment[]>;

  isLoading: boolean = true;
  isEmpty: boolean = false;
  isFiltered: boolean = false;
  lastStatus!: QuoteStatus;
  createQuotation:boolean | undefined = false;

  quoteStatuses = Object.values(QuoteStatus);
  displayedColumns: string[] = ['slNo', 'date', 'quoteId', 'customerName', 'description', 'salesPerson', 'department', 'status', 'action'];

  dataSource = new MatTableDataSource<Quotatation>()
  filteredData = new MatTableDataSource<Quotatation>()

  total: number = 0;
  page: number = 1;
  row: number = 10;
  fromDate: string | null = null
  toDate: string | null = null
  selectedCustomer: string | null = null;
  selectedSalesPerson: string | null = null;
  selectedDepartment: string | null = null;

  private subscriptions = new Subscription();
  private subject = new BehaviorSubject<{ page: number, row: number }>({ page: this.page, row: this.row });

  constructor(
    private _fb: FormBuilder,
    private _quoteService: QuotationService,
    private _router: Router,
    private _dialog: MatDialog,
    private _employeeService: EmployeeService,
    private _customerService: CustomerService,
    private _departetmentService: ProfileService,
  ) { }

  formData = this._fb.group({
    fromDate: [new FormControl()],
    toDate: [new FormControl()],
  })

  ngOnInit() {
    this.checkPermission()
    this.salesPerson$ = this._employeeService.getAllEmployees()
    this.customers$ = this._customerService.getAllCustomers()
    this.departments$ = this._departetmentService.getDepartments()

    this.subscriptions.add(
      this.subject.subscribe((data) => {
        this.page = data.page
        this.row = data.row
        this.getQuotations()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  getQuotations() {
    let access;
    let userId;
    this._employeeService.employeeData$.subscribe((employee) => {
      access = employee?.category.privileges.quotation.viewReport
      userId = employee?._id
    })

    let filterData = {
      page: this.page,
      row: this.row,
      salesPerson: this.selectedSalesPerson,
      customer: this.selectedCustomer,
      fromDate: this.fromDate,
      toDate: this.toDate,
      department: this.selectedDepartment,
      access: access,
      userId:userId
    }
    this.subscriptions.add(
      this._quoteService.getQuotation(filterData)
        .subscribe((data: getQuotation) => {
          if (data) {
            this.dataSource.data = [...data.quotations];
            this.filteredData.data = data.quotations;
            this.total = data.total
            this.isEmpty = false
          } else {
            this.dataSource.data = [];
            this.isEmpty = true;
          }
          this.isLoading = false
        })
    )

  }

  onQuote(data: Quotatation) {
    const navigationExtras: NavigationExtras = {
      state: data
    };

    this._router.navigate(['/quotations/view'], navigationExtras);
  }

  onQuoteEdit(data: quotatationForm) {
    let quoteData = data;
    quoteData.client = (quoteData.client as getCustomer)._id
    quoteData.attention = (quoteData.attention as ContactDetail)._id
    quoteData.department = (quoteData.department as getDepartment)._id
    quoteData.createdBy = (quoteData.createdBy as getEmployee)._id

    const navigationExtras: NavigationExtras = {
      state: quoteData
    };

    this._router.navigate(['/quotations/edit'], navigationExtras);
  }

  handleNotClose(event: MouseEvent) {
    event.stopPropagation();
  }

  onClear() {
    this.isFiltered = false;
    this.fromDate = null
    this.toDate = null
    this.selectedCustomer = null;
    this.selectedSalesPerson = null;
    this.selectedDepartment = null;
    this.getQuotations()
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
    this.getQuotations()
  }

  onStatus(status: QuoteStatus) {
    this.lastStatus = status
    console.log(this.lastStatus)
  }

  updateStatus(i: number, quoteId: string, status: QuoteStatus) {
    this.dataSource.data[i].status = this.lastStatus;
    this.filteredData.data[i].status = this.lastStatus;

    const dialogRef = this._dialog.open(ConfirmationDialogComponent,
      {
        data: {
          title: `Are you absolutely sure?`,
          description: `This action cannot be undone. This will permanently change the status to ${status}.`
        }
      });

    dialogRef.afterClosed().subscribe((approved: boolean) => {
      if (approved) {
        console.log(approved)
        this._quoteService.updateQuoteStatus(quoteId, status).subscribe((res: QuoteStatus) => {
          console.log(res)
          this.dataSource.data[i].status = res;
          this.filteredData.data[i].status = res;
        })
      }
    })
  }

  onfilterApplied() {
    this.isFiltered = true;
    this.getQuotations()
  }

  onClickLpo(data: Quotatation) {
    const lpoDialog = this._dialog.open(UploadLpoComponent, { data: data })
    lpoDialog.afterClosed().subscribe((quote:Quotatation)=>{
      this.getQuotations()
    })
  }

  checkPermission() {
    this._employeeService.employeeData$.subscribe((data) => {
      this.createQuotation = data?.category.privileges.quotation.create
    })
  }

  onPageNumberClick(event: { page: number, row: number }) {
    this.subject.next(event)
  }
}
