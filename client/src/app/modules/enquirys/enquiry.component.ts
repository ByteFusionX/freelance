import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEnquiryDialog } from './create-enquiry/create-enquiry.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { EnquiryTable, getEnquiry, Presale } from 'src/app/shared/interfaces/enquiry.interface';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AssignPresaleComponent } from './assign-presale/assign-presale.component';
import { ViewPresaleComponent } from './view-presale/view-presale.component';
import { HttpEventType } from '@angular/common/http';
import saveAs from 'file-saver';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ViewRejectsComponent } from './view-rejects/view-rejects.component';
import { EventsListComponent } from 'src/app/shared/components/events-list/events-list.component';
import { getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { CustomerService } from 'src/app/core/services/customer/customer.service';

@Component({
  selector: 'app-enquiry',
  templateUrl: './enquiry.component.html',
  styleUrls: ['./enquiry.component.css'],
})
export class EnquiryComponent implements OnInit, OnDestroy {

  enqId: string | null = null
  salesPerson$!: Observable<getEmployee[]>;
  customers$!: Observable<getCustomer[]>;

  isLoading: boolean = true;
  isEmpty: boolean = false;
  assigningPresale: boolean = false;
  assigningPresaleIndex!: number ;
  isFiltered: boolean = false;
  isDeleteOption: boolean = false;
  createEnquiry: boolean | undefined = false;

  status: { name: string }[] = [{ name: 'Work In Progress' }, { name: 'Assigned To Presale Manager' }];
  displayedColumns: string[] = ['enquiryId', 'customerName', 'enquiryDescription', 'salesPersonName', 'department', 'attachedFiles', 'status', 'presale', 'events', 'action'];

  dataSource = new MatTableDataSource<getEnquiry>()
  filteredData = new MatTableDataSource<getEnquiry>()

  total: number = 0;
  page: number = 1;
  row: number = 10;
  fromDate: string | null = null
  toDate: string | null = null
  selectedStatus: string | null = null;
  selectedSalesPerson: string | null = null;
  selectedCustomer: string | null = null;
  selectedDepartment: string | null = null;
  isDeletedClicked: boolean = false;
  isEventClicked: boolean = false;

  private subscriptions = new Subscription();
  private subject = new BehaviorSubject<{ page: number, row: number }>({ page: this.page, row: this.row });

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private _employeeService: EmployeeService,
    private _enquiryService: EnquiryService,
    private _customerService: CustomerService,
    private router: Router,
    private toaster: ToastrService,
    private _router: Router,
    private _route: ActivatedRoute,
  ) { }

  formData = this.fb.group({
    fromDate: new FormControl(),
    toDate: new FormControl(),
  })

  ngOnInit(): void {
    this.subscriptions.add(
      this._employeeService.employeeData$.subscribe((employee) => {
        this.customers$ = this._customerService.getAllCustomers(employee?._id)
        if (employee?.category.role == 'superAdmin') {
          this.isDeleteOption = true
        }

      })
    )
    this.checkPermission()
    this.salesPerson$ = this._employeeService.getAllEmployees()
    this.subscriptions.add(
      this._enquiryService.departmentData$.subscribe((data) => {
        this.selectedDepartment = data
      })
    )

        // Read URL parameters and initialize filters
        this._route.queryParams.subscribe(params => {
          this.page = params['page'] ? parseInt(params['page']) : 1;
          this.row = params['row'] ? parseInt(params['row']) : 10;
          this.fromDate = params['fromDate'] || null;
          this.toDate = params['toDate'] || null;
          this.selectedCustomer = params['customer'] || null;
          this.selectedSalesPerson = params['salesPerson'] || null;
          this.selectedDepartment = params['department'] || null;
    
          // Update form data if dates exist in URL
          if (this.fromDate) {
            this.formData.controls.fromDate.setValue(this.fromDate);
          }
          if (this.toDate) {
            this.formData.controls.toDate.setValue(this.toDate);
          }
    
          // Set isFiltered flag if any filter is applied
          this.isFiltered = !!(this.fromDate || this.toDate || 
                             this.selectedCustomer || this.selectedSalesPerson || 
                             this.selectedDepartment);
    
          // Initialize the BehaviorSubject with the current page and row
          this.subject.next({ page: this.page, row: this.row });
        });

    this.subscriptions.add(
      this.subject.subscribe((data) => {
        this.page = data.page
        this.row = data.row
        this.getEnquiries()
        this.updateUrlParams()
      })
    )
  }

  updateUrlParams() {
    const queryParams: any = {};
    
    if (this.page !== 1) queryParams.page = this.page;
    if (this.row !== 10) queryParams.row = this.row;
    
    if (this.fromDate) queryParams.fromDate = this.fromDate;
    if (this.toDate) queryParams.toDate = this.toDate;
     queryParams.customer = this.selectedCustomer;
     queryParams.salesPerson = this.selectedSalesPerson;
     queryParams.department = this.selectedDepartment;

    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true 
    });
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
      customer: this.selectedCustomer,
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
            const filteredEnquiries = data.enquiry.filter(
              (enq: any) => enq.status != 'Rejected by Presale Engineer' && enq.status != 'Sended by Presale Engineer'
            );
            this.dataSource.data = filteredEnquiries;
            this.filteredData.data = data.enquiry;
            this.total = filteredEnquiries.length;
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


  onDownloadClicks(file: any) {
    this.subscriptions.add(
      this._enquiryService.downloadFile(file.fileName)
        .subscribe({
          next: (event) => {
            if (event.type === HttpEventType.DownloadProgress) {
            } else if (event.type === HttpEventType.Response) {
              const fileContent: Blob = new Blob([event['body']])
              saveAs(fileContent, file.originalname)
            }
          },
          error: (error) => {
            if (error.status == 404) {
              this.toaster.warning('Sorry, The requested file was not found on the server. Please ensure that the file exists and try again.')
            }
          }
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
          this.dataSource._updateChangeSubscription();
          this.enqId = result.enquiryId.slice(-3)
          this.toaster.success('Enquiry created successfully')
        }
      })
    }
  }

  preventClick(event: Event) {
    event.stopPropagation()
  }

  onViewPresale(event: Event, i: number, enquiryData: getEnquiry) {
    event.stopPropagation()
    const presaleDialog = this.dialog.open(ViewPresaleComponent, { data: enquiryData })
    presaleDialog.afterClosed().subscribe((success: boolean) => {
      this.dataSource.data[i].preSale.seenbySalesPerson = true;
      if (success) {
        this.dataSource.data[i].status = 'Assigned To Presale Manager'
        this.dataSource._updateChangeSubscription();
      }
    })
  }

  onAssignPresale(event: Event, preSale: any, enquiryId: string, index: number) {
    event.stopPropagation();

    const presaleDialog = this.dialog.open(AssignPresaleComponent, { data: preSale })
    presaleDialog.afterClosed().subscribe((data: any) => {
      if (data) {
        this.assigningPresale = true;
        this.assigningPresaleIndex = index
        const presaleData = {
          comment: data.comment,
          newPresaleFile: data.newPresaleFile,
          existingPresaleFiles: data.existingPresaleFiles,
          presalePerson: data.presalePerson
        };
        let formData = new FormData();
        formData.append('presaleData', JSON.stringify(presaleData));

        if (presaleData.newPresaleFile) {
          for (let i = 0; i < presaleData.newPresaleFile.length; i++) {
            formData.append('newPresaleFile', (presaleData.newPresaleFile[i] as unknown as Blob))
          }
        }

        this._enquiryService.assignPresale(formData, enquiryId).subscribe((res) => {
          if (res.success) {
            // this.dataSource.data[index].preSale = presaleData as getEnquiry["preSale"];
            this.dataSource.data[index].status = 'Assigned To Presale Manager'
            this.dataSource._updateChangeSubscription();
            this.assigningPresale = false;
            this.toaster.success('Assinged Presale successfully')
          }
        })
      }
    })
  }

  onClear() {
    this.isFiltered = false;
    this.fromDate = null
    this.toDate = null
    this.selectedSalesPerson = null;
    this.selectedDepartment = null;
    this.selectedStatus = null;
    this.formData.reset();
    this.page = 1;
    this.getEnquiries()
    this.updateUrlParams();
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
    this.updateUrlParams();
  }

  onfilterApplied() {
    this.isFiltered = true;
    this.getEnquiries()
    this.updateUrlParams();
  }

  onRowClicks(index: number) {
    let enqData = this.dataSource.data[index]
    if (!this.isDeletedClicked && !this.isEventClicked) {
      if (enqData.status === 'Work In Progress') {
        this._enquiryService.emitToQuote(enqData)
        this.router.navigate(['/quotations/create'])
      } else {
        this.toaster.warning('Sorry,Selected enquiry assinged to presales')
      }
    }
  }

  openReview(rejectionHistory: any) {
    this.dialog.open(ViewRejectsComponent, {
      data: rejectionHistory,
      width: '500px'
    });
  }

  checkPermission() {
    this._employeeService.employeeData$.subscribe((data) => {
      this.createEnquiry = data?.category.privileges.enquiry.create
    })
  }

  onPageNumberClick(event: { page: number, row: number }) {
    this.subject.next(event)
  }

  deleteEnquiry(enquiryId: string, status: string) {
    this.isDeletedClicked = true
    if (status == 'Assigned To Presale Manager' || status == 'Assigned To Presale Engineer' || status == 'Assigned To Presales') {
      this.toaster.warning('Sorry,Selected enquiry assinged to presales')
      return
    }
    const employee = this._employeeService.employeeToken()
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Enquiry',
        description: 'Are you sure you want to delete this enquiry?',
        icon: 'heroExclamationCircle',
        IconColor: 'red'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.subscriptions.add(
          this._enquiryService.deleteEnquiry({ dataId: enquiryId, employeeId: employee.id }).subscribe({
            next: () => {
              this.toaster.success('Enquiry deleted successfully');
              this.getEnquiries()
            },
            error: (error) => {
              this.toaster.error(error.error.message || 'Failed to delete enquiry');
            }
          })
        )
      }
      this.isDeletedClicked = false;
    });
  }

  onEventClicks(enquiryId: string) {
    this.isEventClicked = true;
    const dialog = this.dialog.open(EventsListComponent, { data: { collectionId: enquiryId, from: 'Enquiry' }, width: '500px' })
    dialog.afterClosed().subscribe(()=>{
      this.isEventClicked = false
    })
  }
}
