import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartOptions } from './dashboard.chart';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { BehaviorSubject, filter, map, Observable, Subscription } from 'rxjs';
import { TotalEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { getEmployee, Privileges, SalesTarget } from 'src/app/shared/interfaces/employee.interface';
import { opacityState } from 'src/app/shared/animations/animations.triggers';
import { Router } from '@angular/router';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { Metric } from 'src/app/shared/interfaces/dasbhoard.interface';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [opacityState]
})

export class DashboardComponent implements OnInit, OnDestroy {

  quotes!: number;
  jobs!: number;
  presales!: { pending: number, completed: number };
  graphSeries: { name: string, data: number[] }[] = [];
  graphCategory: string[] = [];
  showChart: boolean = false
  privileges!: Privileges | undefined;
  noDataForChart: boolean = false;

  userId!: string | undefined;
  enquiryAccess!: string | undefined;
  quoteAccess!: string | undefined;
  jobAccess!: string | undefined;

  isEnquiryLoading: boolean = true;
  isQuoteLoading: boolean = true;
  isJobLoading: boolean = true;
  isPresalesLoading: boolean = true;

  enquiries$!: Observable<TotalEnquiry[]>;
  userData$!: Observable<getEmployee | undefined>;
  quotations$!: Observable<{ total: number }>;
  jobs$!: Observable<{ total: number }>;
  presales$!: Observable<{ pending: number, completed: number }>;

  dashboardMetrics$!: Observable<Metric[]>;
  salesTarget!: SalesTarget;
  grossProfitTarget!: SalesTarget;

  filterForm!: FormGroup;
  departments: getDepartment[] = [];
  salesPersons: getEmployee[] = [];

  selectedTarget!: string;

  filtered: boolean = false;
  bothTarget: boolean = false;
  ngSelectLoading: boolean = false;

  private subscriptions = new Subscription()
  public chartOptions!: Partial<ChartOptions>;

  constructor(
    private _enquiryService: EnquiryService,
    private _dashboardService: DashboardService,
    private _employeeService: EmployeeService,
    private _profileService: ProfileService,
    private router: Router,
    private _fb: FormBuilder,
    private _toaster:ToastrService
  ) {
    this.filterForm = this._fb.group({
      fromDate: [''],
      toDate: [''],
      salesPersonIds: [[]],
      departments: [[]]
    });
  }

  ngOnInit(): void {
    this.getDepartments();
    this.getSalesPerson();

    this.userData$ = this._employeeService.employeeData$;
    this.userData$.subscribe((res) => {
      const compareAgainst = res?.category.privileges.dashboard.compareAgainst
      if (compareAgainst == 'personal' && res?.salesTarget && res?.profitTarget) {
        this.salesTarget = res?.salesTarget;
        this.grossProfitTarget = res?.profitTarget;
      } else if (compareAgainst == 'company') {
        this._profileService.getCompanyTargets().subscribe((res) => {
          this.salesTarget = res.salesTarget;
          this.grossProfitTarget = res.grossProfitTarget;
        })
      } else if (compareAgainst == 'both') {
        this._profileService.getCompanyTargets().subscribe((res) => {
          this.salesTarget = res.salesTarget;
          this.grossProfitTarget = res.grossProfitTarget;
        })
        this.selectedTarget = 'company';
        this.bothTarget = true;
      }
    })


    this.getDashboardReports();
    this.dateCategories();
  }

  getDashboardReports() {
    this._employeeService.employeeData$.subscribe((employee) => {
      if (employee) {
        this.userId = employee?._id;
        if (this.userId) {
          this.dashboardMetrics$ = this._dashboardService.getDashboardMetrics(this.userId, this.filterForm.value).pipe(
            map(metrics => {
              const sortedMetrics = metrics.sort((a, b) => a.rank - b.rank);

              let companyRevenue = 0;
              sortedMetrics.forEach((metric) => {
                if (metric.name === 'Revenue Achieved') {
                  companyRevenue = metric.value;
                }
              });
              this.updateGuageReports(companyRevenue);
              return sortedMetrics;
            })
          );

          this._dashboardService.getRevenuePerSalesperson(this.userId, this.filterForm.value).subscribe((res) => {
            this._dashboardService.updateDonutChart(res)
          })

          this._dashboardService.getGrossProfitForLastSevenMonths(this.userId, this.filterForm.value).subscribe((res) => {
            this._dashboardService.updateGraphChart({ profitPerMonths: res, profitTarget: this.grossProfitTarget })
          })

          this._dashboardService.getEnquirySalesConversion(this.userId, this.filterForm.value).subscribe((res) => {
            this._dashboardService.updateEnquiryConversions(res)
          })

          this._dashboardService.getPresaleJobSalesConversion(this.userId, this.filterForm.value).subscribe((res) => {
            this._dashboardService.updatePresaleConversions(res)
          })



        }
      }
    })
  }

  updateGuageReports(companyRevenue: number) {
    let guageReport = { companyRevenue, ...this.salesTarget }


    this._dashboardService.updateGuageChart(guageReport)
  }

  getDepartments() {
    this._profileService.getDepartments().subscribe((departments) => {
      this.departments = departments;
    })
  }

  getSalesPerson() {
    let access;
    let userId;
    this._employeeService.employeeData$.subscribe((employee) => {
      access = employee?.category.privileges.employee.viewReport
      userId = employee?._id
    })

    let filterData = {
      page: 1,
      row: 1000,
      search: '',
      access: access,
      userId: userId
    }

    this._employeeService.getEmployees(filterData).subscribe((employees) => {
      this.salesPersons = employees.employees;
    })
  }

  onCompareChange() {
    this.ngSelectLoading = true;
    if (this.selectedTarget == 'personal') {
      this.userData$.subscribe((res) => {
        if (res?.salesTarget && res?.profitTarget) {
          this.salesTarget = res?.salesTarget;
          this.grossProfitTarget = res?.profitTarget;
          this._dashboardService.updateGuageChart(this.salesTarget)
          this._dashboardService.updateGraphChart({ profitTarget: this.grossProfitTarget })
          this.ngSelectLoading = false;
        } else {
          this.ngSelectLoading = false;
          this.selectedTarget = 'company'
          this._toaster.warning('Sales or Profit targets are not currently defined.')
        }
      }).unsubscribe()
    } else if (this.selectedTarget == 'company') {
      this._profileService.getCompanyTargets().subscribe((res) => {
        this.salesTarget = res.salesTarget;
        this.grossProfitTarget = res.grossProfitTarget;
        this._dashboardService.updateGuageChart(this.salesTarget)
        this._dashboardService.updateGraphChart({ profitTarget: this.grossProfitTarget })
        this.ngSelectLoading = false;
      })
    }
  }

  onSubmit() {
    this.filtered = true;
    this.getDashboardReports()
  }

  onClear() {
    this.filtered = false;
    this.filterForm.reset()
    this.getDashboardReports();
  }


  enquiryLoading() {
    this.subscriptions.add(
      this.enquiries$.subscribe({
        next: ((data) => {
          if (data) {
            this.isEnquiryLoading = false
          }
        }),
        error: ((err) => {
          this.isEnquiryLoading = true
        })
      })
    )
  }

  presalesLoading() {
    this.subscriptions.add(
      this.presales$.subscribe({
        next: ((data) => {
          if (data) {
            this.isPresalesLoading = false
          }
        }),
        error: ((err) => {
          this.isPresalesLoading = true
        })
      })
    )
  }

  quoteLoading() {
    this.subscriptions.add(
      this.quotations$.subscribe({
        next: ((data) => {
          if (data) {
            this.isQuoteLoading = false
          }
        }),
        error: ((err) => {
          this.isQuoteLoading = true
        })
      })
    )
  }

  jobLoading() {
    this.subscriptions.add(
      this.jobs$.subscribe({
        next: ((data) => {
          if (data) {
            this.isJobLoading = false
          }
        }),
        error: ((err) => {
          this.isJobLoading = true
        })
      })
    )
  }

  dateCategories() {
    let currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const formattedDate = `${year}-${month.toString().padStart(2, '0')}`;
      this.graphCategory.unshift(formattedDate);
      currentDate.setMonth(currentDate.getMonth() - 1);
    }
  }

  onDepartmentSelect(departmentId: string | undefined) {
    if (departmentId) {
      this._enquiryService.depSubject.next(departmentId)
      this.router.navigate(['/enquiry'])
    }
  }

  onClickLearnButton() {
    window.open('https://neuron.com.qa/')
  }

  getChartDetails() {
    this.subscriptions.add(
      this._enquiryService.monthlyEnquiries(this.enquiryAccess, this.userId).subscribe((data) => {
        data.map((item) => {
          const dateArray: number[] = new Array(12).fill(0)
          let depName = item.department[0].departmentName.toUpperCase()
          let dep = this.graphSeries.find((ser) => ser.name == depName)

          if (!dep) {
            let obj = { name: depName, data: dateArray }
            this.graphSeries.push(obj)
            dep = this.graphSeries[this.graphSeries.length - 1]
          }

          let date: string = `${item.year}-${item.month.toString().padStart(2, '0')}`
          let index = this.graphCategory.indexOf(date)
          dep.data[index] = item.total
        })
        if (data.length) {
          this.chartDetails()
        } else {
          this.noDataForChart = true
        }
      })
    )
  }

  chartDetails() {
    this.chartOptions = {
      series: this.graphSeries,
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: this.graphCategory
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      }
    };
    this.showChart = true;
  }

  getYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2024; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse();
  }

  getMonths(): string[] {
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

}
