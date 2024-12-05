import { HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Observable, Subscription, catchError, tap, throwError } from 'rxjs';
import { JobService } from 'src/app/core/services/job/job.service';
import { JobStatus, JobTable, getJob } from 'src/app/shared/interfaces/job.interface';
import { saveAs } from 'file-saver'
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { GeneratePdfReport } from 'src/app/core/services/generateReport.service';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ApproveDealComponent } from 'src/app/modules/deal-sheet/approve-deal/approve-deal.component';
import { getQuotatation, Quotatation } from 'src/app/shared/interfaces/quotation.interface';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { QuotationPreviewComponent } from 'src/app/shared/components/quotation-preview/quotation-preview.component';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { getCreators } from 'src/app/shared/interfaces/employee.interface';
@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent {
  selectedDateFormat: string = "monthly";
  selectedEmployee: string | null = null;
  selectedFile!: string | undefined;
  progress: number = 0
  reportDate: string = '';
  searchQuery: string = '';

  isEnter: boolean = false;
  lastStatus!: JobStatus;
  jobStatuses = Object.values(JobStatus);
  employees$!: Observable<getCreators[]>;

  totalLpoValue: number = 0;
  total: number = 0;
  page: number = 1;
  row: number = 10;

  private subject = new BehaviorSubject<{ page: number, row: number }>({ page: this.page, row: this.row });

  jobId: string | null = null

  dataSource = new MatTableDataSource<getJob>()
  filteredData = new MatTableDataSource<getJob>()

  isLoading: boolean = true;
  isEmpty: boolean = false;
  loader = this.loadingBar.useRef();

  private subscriptions = new Subscription();


  constructor(private _jobService: JobService,
    private toast: ToastrService,
    private _dialog: MatDialog,
    private _fb: FormBuilder,
    private _generatePdfSerive: GeneratePdfReport,
    private _employeeService: EmployeeService,
    private _quotationService: QuotationService,
    private loadingBar: LoadingBarService
  ) { }


  ngOnInit() {
    this.employees$ = this._jobService.getJobSalesPerson();
    this.getAllJobs()
  }

  selectedStatus!: number;

  formData = this._fb.group({
    fromDate: new FormControl(),
    toDate: new FormControl(),
  })

  status: { value: string }[] = [
    { value: 'Work In Progress' },
    { value: 'Delivered' },
    { value: 'Partially Delivered' },
    { value: 'Completed' },
    { value: 'Cancelled' },
    { value: 'On Hold' },
    { value: 'Invoiced' }

  ];

  onfilterApplied() {
    this.getAllJobs()
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
    this.getAllJobs()
  }


  displayedColumns: string[] = ['jobId', 'customerName', 'description', 'salesPersonName', 'department', 'quotations', 'dealSheet', 'lpo', 'lpoValue', 'status', 'action'];

  getAllJobs(selectedMonth?: number, selectedYear?: number) {
    this.isLoading = true;

    let access;
    let userId;
    this._employeeService.employeeData$.subscribe((employee) => {
      access = employee?.category.privileges.jobSheet.viewReport
      userId = employee?._id
    })
    let filterData = {
      search: this.searchQuery,
      page: this.page,
      row: this.row,
      salesPerson: this.selectedEmployee,
      status: this.selectedStatus,
      selectedMonth: selectedMonth,
      selectedYear: selectedYear,
      access: access,
      userId: userId
    }

    this.subscriptions.add(
      this._jobService.getJobs(filterData).subscribe({
        next: (data: JobTable) => {       
          this.dataSource.data = [...data.job];
          this.filteredData.data = data.job;
          this.total = data.total;
          this.totalLpoValue = data.totalLpo;
          this.isEmpty = false;
          this.isLoading = false;
        },
        error: ((error) => {
          if (error.status == 504) this.jobId = '000'
          this.dataSource.data = []
          this.isLoading = false;
          this.isEmpty = true;
        })
      })
    )

  }

  handleNotClose(event: MouseEvent) {
    event.stopPropagation();
  }

  onDownloadClicks(file: any) {
    this.selectedFile = file.fileName
    this.subscriptions.add(
      this._jobService.downloadFile(file.fileName)
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

  onGenerateReport() {
    this.getAllJobs()
  }

  onViewDealSheet(quoteData: Quotatation, salesPerson: any, customer: any) {
    quoteData.createdBy = salesPerson;
    quoteData.client = customer;
    let priceDetails = {
      totalSellingPrice: 0,
      totalCost: 0,
      profit: 0,
      perc: 0
    }

    const quoteItems =  quoteData.dealData.updatedItems.map((item) => {
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

    const totalAdditionalValue = quoteData.dealData.additionalCosts.reduce((acc, curr) => {
      return acc += curr.value;
    }, 0)

    priceDetails.totalCost += totalAdditionalValue;
    priceDetails.totalSellingPrice -= quoteData.totalDiscount;
    priceDetails.profit = priceDetails.totalSellingPrice - priceDetails.totalCost;
    priceDetails.perc = (priceDetails.profit / priceDetails.totalSellingPrice) * 100

    this._dialog.open(ApproveDealComponent,
      {
        data: { approval: false, quoteData, quoteItems, priceDetails },
        width: '1200x'
      });
  }

  onPreviewPdf(quotedData: getQuotatation, salesPerson: any, customer: any, attention: any) {
    this.loader.start()
    quotedData.createdBy = salesPerson;
    quotedData.client = customer;
    quotedData.attention = attention;
    let quoteData: getQuotatation = quotedData;
    const pdfDoc = this._quotationService.generatePDF(quoteData)
    pdfDoc.then((pdf) => {
      pdf.getBlob((blob: Blob) => {
        let url = window.URL.createObjectURL(blob);

        let dialogRef = this._dialog.open(QuotationPreviewComponent,
          {
            data: url
          });
      });
    });
    this.loader.complete()
  }

  onStatus(event: Event, status: JobStatus) {
    event.stopPropagation()
    this.lastStatus = status
  }

  updateStatus(i: number, jobId: string, status: JobStatus) {
    this.dataSource.data[i].status = this.lastStatus;
    this.filteredData.data[i].status = this.lastStatus;

    const dialogRef = this._dialog.open(ConfirmationDialogComponent,
      {
        data: {
          title: `Are you absolutely sure?`,
          description: `This action cannot be undone. This will permanently change the status to ${status}.`,
          icon: 'heroExclamationCircle',
          IconColor: 'orange'
        }
      });

    dialogRef.afterClosed().subscribe((approved: boolean) => {
      if (approved) {
        this._jobService.updateJobStatus(jobId, status).subscribe((res: JobStatus) => {
          this.dataSource.data[i].status = res;
          this.filteredData.data[i].status = res;
        })
      }
    })
  }


  generatePdf(dateRange: { selectedMonth?: number, selectedYear: number, selectedMonthName?: string, download: boolean }) {
    if (dateRange.selectedMonth && dateRange.selectedYear) {
      this.reportDate = `${dateRange.selectedMonthName} - ${dateRange.selectedYear}`;
      this.getJobsForPdf(dateRange.selectedMonth, dateRange.selectedYear).subscribe(() => {
        if (dateRange.download) {
          this.generatePdfAfterDataFetch();
        }
      });
    } else {
      this.reportDate = `${dateRange.selectedYear}`;
      this.getJobsForPdf(undefined, dateRange.selectedYear).subscribe(() => {
        if (dateRange.download) {
          this.generatePdfAfterDataFetch();
        }
      });
    }
  }

  getJobsForPdf(selectedMonth?: number, selectedYear?: number): Observable<JobTable> {
    this.isLoading = true;
    let access;
    let userId;
    this._employeeService.employeeData$.subscribe((employee) => {
      access = employee?.category.privileges.jobSheet.viewReport
      userId = employee?._id
    })
    let filterData = {
      search: this.searchQuery,
      page: this.page,
      row: this.row,
      status: this.selectedStatus,
      salesPerson: this.selectedEmployee,
      selectedMonth: selectedMonth,
      selectedYear: selectedYear,
      access: access,
      userId: userId      
    };

    return this._jobService.getJobs(filterData).pipe(
      tap((data: JobTable) => {
        this.dataSource.data = [...data.job];
        this.filteredData.data = data.job;
        this.totalLpoValue = data.totalLpo;
        this.total = data.total;
        this.isEmpty = false;
        this.isLoading = false;
      }),
      catchError((error) => {
        if (error.status == 504) {
          this.jobId = '000';
        }
        this.dataSource.data = [];
        this.isLoading = false;
        this.isEmpty = true;
        return throwError(error);
      })
    );
  }

  generatePdfAfterDataFetch() {
    if (!this.isEmpty) {
      const tableHeader: string[] = ['JobId', 'Customer', 'Description', 'Sales Person', 'Department', 'Quote','Deal', 'LPO Val.', 'Status'];
      const tableData = this.dataSource.data.map((data: any) => {
        return [
          data.jobId,
          data.clientDetails.companyName,
          data.quotation.subject,
          `${data.salesPersonDetails[0].firstName} ${data.salesPersonDetails[0].lastName}`,
          data.departmentDetails[0].departmentName,
          data.quotation.quoteId,
          data.quotation.dealData.dealId,
          data.quotation.lpoValue,
          data.status
        ];
      });
      const width = ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto','auto', 'auto'];
      this._generatePdfSerive.generatePdf('Job Report', this.reportDate, tableData, tableHeader, width)
    } else {
      this.toast.warning('No Data to generate Report');
    }
  }


  onRemoveReport() {
    this.reportDate = ''
    this.getAllJobs()
  }


  onPageNumberClick(event: { page: number, row: number }) {
    this.subject.next(event)
  }

  onDeleteJob(jobId: string) {
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Job',
        description: 'Are you sure you want to delete this job? This action cannot be undone.',
        icon: 'heroExclamationTriangle',
        IconColor: 'red'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._jobService.deleteJob(jobId).subscribe({
          next: () => {
            this.toast.success('Job deleted successfully');
            this.getAllJobs();
          },
          error: (error) => {
            this.toast.error('Failed to delete job');
          }
        });
      }
    });
  }

}
