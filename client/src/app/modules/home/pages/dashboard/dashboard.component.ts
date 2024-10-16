import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartOptions } from './dashboard.chart';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { BehaviorSubject, filter, map, Observable, Subscription } from 'rxjs';
import { TotalEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { getEmployee, Privileges, RangeTarget, Target } from 'src/app/shared/interfaces/employee.interface';
import { opacityState } from 'src/app/shared/animations/animations.triggers';
import { Router } from '@angular/router';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { Metric } from 'src/app/shared/interfaces/dasbhoard.interface';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Style, Workbook } from 'exceljs';
import * as fs from 'file-saver';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [opacityState]
})

export class DashboardComponent implements OnInit, OnDestroy {
  userId!: string | undefined;

  userData$!: Observable<getEmployee | undefined>;

  dashboardMetrics$!: Observable<Metric[]>;

  salesTarget!: RangeTarget;
  grossProfitTarget!: RangeTarget;
  targets!: Target[];

  jobAccess: boolean = true;

  filterForm!: FormGroup;
  departments: getDepartment[] = [];
  years: string[] = [];
  salesPersons: getEmployee[] = [];

  selectedTarget!: string;
  selectedTargetYear: string = 'total';
  selectedSalespersonName: string = ''

  filtered: boolean = false;
  bothTarget: boolean = false;
  ngSelectLoading: boolean = false;
  disablePersonalTarget: boolean = false;

  minDate!: string;
  maxDate!: string;

  private subscriptions = new Subscription()
  public chartOptions!: Partial<ChartOptions>;

  constructor(
    private _dashboardService: DashboardService,
    private _employeeService: EmployeeService,
    private _profileService: ProfileService,
    private _fb: FormBuilder,
    private _toaster: ToastrService,
    private http: HttpClient
  ) {
    this.filterForm = this._fb.group({
      fromDate: [''],
      toDate: [''],
      salesPersonIds: [],
      departments: []
    });
  }

  ngOnInit(): void {
    this.getSalesPerson();
    this.getDepartments();
    this.getSalesTarget(true);
    this.getDashboardReports();
  }

  getDashboardReports() {
    this.subscriptions.add(
      this._employeeService.employeeData$.subscribe((employee) => {
        if (employee) {
          this.userId = employee?._id;
          if (this.userId) {
            this.dashboardMetrics$ = this._dashboardService.getDashboardMetrics(this.userId, this.filterForm.value).pipe(
              map(metrics => {
                const sortedMetrics = metrics.sort((a, b) => a.rank - b.rank);
                console.log(sortedMetrics)
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
            this.subscriptions.add(
              this._dashboardService.getRevenuePerSalesperson(this.userId, this.filterForm.value).subscribe((res) => {
                this._dashboardService.updateDonutChart(res)
              })
            )

            this.subscriptions.add(
              this._dashboardService.getGrossProfitForLastSevenMonths(this.userId, this.filterForm.value).subscribe((res) => {
                this._dashboardService.updateGraphChart({ profitPerMonths: res, profitTarget: this.grossProfitTarget })
              })
            )

            this.subscriptions.add(
              this._dashboardService.getEnquirySalesConversion(this.userId, this.filterForm.value).subscribe((res) => {
                this._dashboardService.updateEnquiryConversions(res)
              })
            )

            this.subscriptions.add(
              this._dashboardService.getPresaleJobSalesConversion(this.userId, this.filterForm.value).subscribe((res) => {
                this._dashboardService.updatePresaleConversions(res)
              })
            )

          }
        }
      })
    )
  }

  updateGuageReports(companyRevenue: number) {
    let guageReport = { companyRevenue, ...this.salesTarget }


    this._dashboardService.updateGuageChart(guageReport)
  }

  getDepartments() {
    this.subscriptions.add(
      this._profileService.getDepartments().subscribe((departments) => {
        this.departments = departments;
      })
    )
  }

  getSalesPerson() {
    let access;
    let userId;
    this.subscriptions.add(
      this._employeeService.employeeData$.subscribe((employee) => {
        access = employee?.category.privileges.employee.viewReport
        let jobAccess = employee?.category.privileges.jobSheet.viewReport;
        this.jobAccess = jobAccess && jobAccess !== 'none' ? true : false
        userId = employee?._id
      })
    )

    let filterData = {
      page: 1,
      row: 1000,
      search: '',
      access: access,
      userId: userId
    }

    if (access && access !== 'none') {
      this._employeeService.getEmployees(filterData).subscribe((employees) => {
        console.log(employees.employees);

        this.salesPersons = employees.employees;
      })
    }
  }

  getSalesTarget(reset: boolean) {
    this.userData$ = this._employeeService.employeeData$;
    this.userData$.subscribe((res) => {
      const compareAgainst = reset ? res?.category.privileges.dashboard.compareAgainst : this.selectedTarget;
      if (reset) {
        this.disablePersonalTarget = res?.targets && res.targets.length ? false : true;
      }

      if (compareAgainst == 'personal' && res?.targets) {
        this.handleTargets(res.targets);
      } else if (compareAgainst == 'company' || compareAgainst == 'both') {
        this.subscriptions.add(
          this._profileService.getCompanyTargets().subscribe((res) => {
            this.handleTargets(res.targets);
          })
        )
        if (compareAgainst == 'both' && reset) {
          this.selectedTarget = 'company';
          this.bothTarget = true;
        }
      }
    })
  }

  onCompareChange() {
    this.ngSelectLoading = true;
    this.selectedTargetYear = 'total';
    this.onTargetYearChange();

    const salesPersonIds = this.filterForm.get('salesPersonIds')?.value;
    const oneSalesPersonSelected = Array.isArray(salesPersonIds) && salesPersonIds.length === 1;

    if (this.selectedTarget == 'personal' && oneSalesPersonSelected) {
      const salesPerson = this.salesPersons.find((person) => person._id == salesPersonIds[0])
      if (salesPerson?.targets && salesPerson.targets.length) {
        this.handleTargets(salesPerson?.targets);
        this.ngSelectLoading = false;
      }
    } else if (this.selectedTarget == 'personal') {
      this.userData$.subscribe((res) => {
        if (res?.targets && res?.targets) {
          this.handleTargets(res.targets);
          this.ngSelectLoading = false;
        } else {
          this.ngSelectLoading = false;
          this.selectedTarget = 'company'
          this._toaster.warning('Sales or Profit targets are not currently defined.')
        }
      }).unsubscribe()
    } else if (this.selectedTarget == 'company') {
      this._profileService.getCompanyTargets().subscribe((res) => {
        this.handleTargets(res.targets);
        this.ngSelectLoading = false;
      })
    }
  }

  onTargetYearChange() {
    if (this.selectedTargetYear == 'total') {
      this.minDate = ''
      this.maxDate = ''
    } else {
      this.minDate = `${this.selectedTargetYear}-01-01`
      this.maxDate = `${this.selectedTargetYear}-12-31`
    }
    this.filterForm.patchValue({ fromDate: this.minDate, toDate: this.maxDate })
    this.getDashboardReports();

    this.getSalesTarget(false)
  }


  handleTargets(targets: Target[]) {
    this.years = targets.map((target) => target.year);
    const extractedData = this.extractRevenueAndProfitTargets(targets);
    this.salesTarget = extractedData?.salesRevenue as RangeTarget;
    this.grossProfitTarget = extractedData?.grossProfit as RangeTarget;
    this._dashboardService.updateGuageChart(this.salesTarget);
    this._dashboardService.updateGraphChart({ profitTarget: this.grossProfitTarget });
  }

  extractRevenueAndProfitTargets(targets: Target[]) {
    if (this.selectedTargetYear == 'total') {
      return targets.reduce((acc, curr) => {
        acc.grossProfit = {
          criticalRange: acc.grossProfit.criticalRange + curr.grossProfit.criticalRange,
          moderateRange: acc.grossProfit.moderateRange + curr.grossProfit.moderateRange,
          targetValue: acc.grossProfit.targetValue + curr.grossProfit.targetValue,
        };

        acc.salesRevenue = {
          criticalRange: acc.salesRevenue.criticalRange + curr.salesRevenue.criticalRange,
          moderateRange: acc.salesRevenue.moderateRange + curr.salesRevenue.moderateRange,
          targetValue: acc.salesRevenue.targetValue + curr.salesRevenue.targetValue,
        };

        return acc;
      }, {
        salesRevenue: { targetValue: 0, criticalRange: 0, moderateRange: 0 },
        grossProfit: { targetValue: 0, criticalRange: 0, moderateRange: 0 },
      });
    } else {
      return targets.find((target) => target.year == this.selectedTargetYear)
    }
  }

  onFilter() {
    this.filtered = true;

    const salesPersonIds = this.filterForm.get('salesPersonIds')?.value;
    const oneSalesPersonSelected = Array.isArray(salesPersonIds) && salesPersonIds.length === 1;

    if (oneSalesPersonSelected) {
      const salesPerson = this.salesPersons.find((person) => person._id == salesPersonIds[0])
      this.selectedSalespersonName = `(${salesPerson?.firstName} ${salesPerson?.lastName})`
      this.disablePersonalTarget = salesPerson?.targets && salesPerson.targets.length ? false : true;
      if (this.selectedTarget == 'personal' && salesPerson?.targets && salesPerson.targets.length) {
        this.handleTargets(salesPerson?.targets);
      }
    } else {
      this.selectedSalespersonName = ''
    }

    this.getDashboardReports();
  }

  onClearFilter() {
    this.filtered = false;
    this.filterForm.reset();
    this.selectedSalespersonName = '';
    this.getSalesTarget(true)
    this.filterForm.patchValue({ fromDate: this.minDate, toDate: this.maxDate })
    this.getDashboardReports();
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

  exportToExcel() {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Report');


    const nameCellStyle = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E4DFEC' } },
      font: { size: 13, bold: true, color: { argb: '000000' } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    // Style for data rows
    const rowStyle = {
      font: { size: 13 },
      alignment: { horizontal: 'left' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    if (this.filtered) {
      worksheet.addRow(['Filters Applied']);

      // Function to get employee names by IDs
      const getEmployeeNames = (ids: string[]) => {
        console.log(ids);

        return ids
          .map(id => {
            const employee = this.salesPersons.find(person => person._id === id);
            return employee ? `${employee.firstName} ${employee.lastName}` : null;
          })
          .filter(Boolean) // Remove null values
          .join(', ');
      };

      // Function to get department names by IDs
      const getDepartmentNames = (ids: string[]) => {
        return ids
          .map(id => {
            const department = this.departments.find(dep => dep._id === id);
            return department ? department.departmentName : null;
          })
          .filter(Boolean) // Remove null values
          .join(', ');
      };

      const createFilterString = (label: string, value: any) => {
        if (Array.isArray(value)) {
          return value.length > 0 ? `${label}: ${value.join(', ')}` : '';
        } else {
          return value ? `${label}: ${value}` : '';
        }
      };

      const filtersRow = worksheet.addRow([
        createFilterString('From Date', this.filterForm.get('fromDate')?.value),
        createFilterString('To Date', this.filterForm.get('toDate')?.value),
        createFilterString('SalesPerson', getEmployeeNames(this.filterForm.get('salesPersonIds')?.value || [])),
        createFilterString('Departments', getDepartmentNames(this.filterForm.get('departments')?.value || []))
      ].filter(Boolean)); // Remove empty strings

      filtersRow.font = { italic: true, color: { argb: 'FF0000FF' } };
      worksheet.addRow([]); // Empty row for spacing
    }

    this.dashboardMetrics$.subscribe((data) => {
      data.forEach(item => {
        const row = item.type == 'QAR' ?
          worksheet.addRow([item.name, `${item.value.toFixed(2)} ${item.type}`]) :
          worksheet.addRow([item.name, `${item.value} ${item.type}`]);

        // Apply style to the "name" column only (first column)
        const nameCell = row.getCell(1);
        nameCell.style = nameCellStyle as Partial<Style>;

        // Style the rest of the cells normally
        row.eachCell((cell, colNumber) => {
          if (colNumber > 1) {
            cell.style = rowStyle as Partial<Style>;
          }
        });
      });

      // // Auto-fit columns
      worksheet.columns.forEach((column: any) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const columnLength = cell.value ? cell.value.toString().length + 4 : 14;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 12 ? 12 : maxLength;
      });

      // Save the Excel file
      workbook.xlsx.writeBuffer().then((buffer) => {
        fs.saveAs(new Blob([buffer]), `Report_${new Date().getTime()}.xlsx`);
      });
    })

  }



  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

}
