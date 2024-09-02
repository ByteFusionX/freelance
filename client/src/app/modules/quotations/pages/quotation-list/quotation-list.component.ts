import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationExtras, Router } from '@angular/router';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { ContactDetail, getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { dealData, getQuotation, Quotatation, quotatationForm, QuoteStatus } from 'src/app/shared/interfaces/quotation.interface';
import { UploadLpoComponent } from '../upload-lpo/upload-lpo.component';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { DealFormComponent } from '../deal-form/deal-form.component';
import { ViewLpoComponent } from '../view-lpo/view-lpo.component';
import { ViewReportComponent } from '../view-report/view-report.component';
import { ApproveDealComponent } from 'src/app/modules/deal-sheet/approve-deal/approve-deal.component';

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
  isEnter: boolean = false;
  lastStatus!: QuoteStatus;
  createQuotation: boolean | undefined = false;
  loader = this.loadingBar.useRef();
  searchQuery: string = '';

  quoteStatuses = Object.values(QuoteStatus);
  displayedColumns: string[] = ['date', 'quoteId', 'customerName', 'description', 'salesPerson', 'department', 'totalCost', 'status', 'dealStatus', 'action'];

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
    private loadingBar: LoadingBarService
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

  ngModelChange() {
    if (this.searchQuery == '' && this.isEnter) {
      this.onSearch();
      this.isEnter = !this.isEnter;
    }
  }

  onSearch() {
    this.isEnter = true
    this.isLoading = true;
    this.getQuotations()
  }

  getQuotations() {
    this.isLoading = true;
    let access;
    let userId;
    this._employeeService.employeeData$.subscribe((employee) => {
      access = employee?.category.privileges.quotation.viewReport
      userId = employee?._id
    })

    let filterData = {
      search: this.searchQuery,
      page: this.page,
      row: this.row,
      salesPerson: this.selectedSalesPerson,
      customer: this.selectedCustomer,
      fromDate: this.fromDate,
      toDate: this.toDate,
      department: this.selectedDepartment,
      access: access,
      userId: userId
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

  onRowClicks(index: number) {
    let data = this.dataSource.data[index]
    const navigationExtras: NavigationExtras = {
      state: data
    };

    this._router.navigate(['/quotations/view'], navigationExtras);
  }

  onQuoteEdit(data: quotatationForm, event: Event) {
    event.stopPropagation()
    let quoteData = data;

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

  onStatus(event: Event, status: QuoteStatus) {
    event.stopPropagation()
    this.lastStatus = status
  }

  updateStatus(i: number, quoteId: string, status: QuoteStatus) {
    this.dataSource.data[i].status = this.lastStatus;
    this.filteredData.data[i].status = this.lastStatus;

    const dialogRef = this._dialog.open(ConfirmationDialogComponent,
      {
        data: {
          title: `Are you absolutely sure?`,
          description: `Please note that the status will be updated to ${status}. The change will be reflected in the reports accordingly.`,
          icon: 'heroExclamationCircle',
          IconColor: 'orange'
        }
      });

    dialogRef.afterClosed().subscribe((approved: boolean) => {
      if (approved) {
        this._quoteService.updateQuoteStatus(quoteId, status).subscribe((res: QuoteStatus) => {
          this.dataSource.data[i].status = res;
          this.filteredData.data[i].status = res;
        })
      }
    })
  }


  onPreviewDeal(approval: boolean, quoteData: Quotatation, event: Event, index: number) {
    event.stopPropagation()
    let priceDetails = {
      totalSellingPrice: 0,
      totalCost: 0,
      profit: 0,
      perc: 0,
    }

    const quoteItems = quoteData.items.map((item) => {
      let itemSelected = 0;

      item.itemDetails.map((itemDetail) => {
        if (itemDetail.dealSelected) {
          itemSelected++;
          priceDetails.totalSellingPrice += itemDetail.unitCost / (1 - (itemDetail.profit / 100)) * itemDetail.quantity;
          priceDetails.totalCost += itemDetail.quantity * itemDetail.unitCost;
          return itemDetail
        }
        return;
      })

      if (itemSelected) return item;

      return;
    });

    priceDetails.profit = priceDetails.totalSellingPrice - priceDetails.totalCost;
    priceDetails.perc = (priceDetails.profit / priceDetails.totalSellingPrice) * 100

    const dialogRef = this._dialog.open(ApproveDealComponent,
      {
        data: { approval, quoteData, quoteItems, priceDetails, quoteView: true },
        width: '900px'
      });

    dialogRef.afterClosed().subscribe(() => {
      this.dataSource.data[index].dealData.seenedBySalsePerson = true;
      this.dataSource._updateChangeSubscription()
    })
  }

  onfilterApplied() {
    this.isFiltered = true;
    this.getQuotations();
  }

  generateReport() {
    let access;
    let userId;
    this._employeeService.employeeData$.subscribe((employee) => {
      access = employee?.category.privileges.quotation.viewReport
      userId = employee?._id
    })

    let filterData = {
      salesPerson: this.selectedSalesPerson,
      customer: this.selectedCustomer,
      fromDate: this.fromDate,
      toDate: this.toDate,
      department: this.selectedDepartment,
      access: access,
      userId: userId
    }
    this._dialog.open(ViewReportComponent,
      {
        data: filterData,
        width: '768px'
      })
  }

  onClickLpo(data: Quotatation, event: Event) {
    event.stopPropagation()
    const lpoDialog = this._dialog.open(UploadLpoComponent, { data: data, width: '500px' })
    lpoDialog.afterClosed().subscribe((quote: Quotatation) => {
      if (quote) {
        this.loader.start()
        this.getQuotations()
        this.loader.complete()
      }
    })
  }

  onViewLpo(data: Quotatation, event: Event) {
    event.stopPropagation()
    this._dialog.open(ViewLpoComponent,
      {
        data: data
      });
  }

  onConvertToDealSheet(data: Quotatation, event: Event, index: number) {
    event.stopPropagation()
    const dialogRef = this._dialog.open(DealFormComponent,
      {
        data: data,
        width: '900px'
      });

    dialogRef.afterClosed().subscribe((dealData: dealData) => {
      if (dealData) {
        this._quoteService.saveDealSheet(dealData, data._id).subscribe((res) => {
          this.dataSource.data[index].items = res.items;
          this.dataSource.data[index].dealData = res.dealData;
          this.dataSource._updateChangeSubscription();
        })
      }
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

  calculateUnitPrice(i: number, j: number, quoteData: Quotatation) {
    const decimalMargin = quoteData.items[i].itemDetails[j].profit / 100;
    return quoteData.items[i].itemDetails[j].unitCost / (1 - decimalMargin)
  }

  calculateTotalPrice(i: number, j: number, quoteData: Quotatation) {
    return this.calculateUnitPrice(i, j, quoteData) * quoteData.items[i].itemDetails[j].quantity;
  }

  calculateSellingPrice(quoteData: Quotatation): number {
    let totalCost = 0;
    quoteData.items.forEach((item, i) => {
      item.itemDetails.forEach((itemDetail, j) => {
        totalCost += this.calculateTotalPrice(i, j, quoteData)
      })
    })
    return totalCost;
  }

  calculateDiscoutPrice(quoteData: Quotatation): number {
    return this.calculateSellingPrice(quoteData) - quoteData.totalDiscount
  }
}
