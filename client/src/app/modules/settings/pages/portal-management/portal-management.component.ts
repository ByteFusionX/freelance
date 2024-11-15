import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CreateDepartmentDialog } from '../create-department/create-department.component';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NoteFormComponent } from '../note-form/note-form.component';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { CreateCategoryComponent } from 'src/app/modules/home/pages/employees/create-category/create-category.component';
import { ToastrService } from 'ngx-toastr';
import { EditCategoryComponent } from '../edit-category/edit-category.component';
import { GetCategory, Privileges, Target } from 'src/app/shared/interfaces/employee.interface';
import { SetTargetComponent } from 'src/app/shared/components/set-target/set-target.component';

@Component({
  selector: 'app-portal-management',
  templateUrl: './portal-management.component.html',
  styleUrls: ['./portal-management.component.css']
})
export class PortalManagementComponent {
  privileges!: Privileges | undefined;

  isTargetEmpty: boolean = false

  openCreateForm: boolean = false;
  isTargetLoading: boolean = true
  isDepartmentLoading: boolean = true
  isCustomerDepartmentLoading: boolean = true
  isNotesLoading: boolean = true
  isCategoryLoading: boolean = true;
  categorySection: boolean = false;

  departmentDisplayedColumns: string[] = ['position', 'name', 'head', 'date', 'action'];
  customerDepartmentDisplayedColumns: string[] = ['position', 'name', 'date'];
  cstcDisplayedColumns: string[] = ['customerNote', 'termsCondition'];
  categoryDisplayedColumns: string[] = ['slNo', 'categoryName', 'role', 'count', 'action'];
  companyTargetColumns: string[] = ['year', 'targetType', 'targetValue', 'critical', 'moderate', 'action'];

  targets: Target[] = [];

  departmentDataSource: any = new MatTableDataSource();
  customerDepartmentDataSource: any = new MatTableDataSource();
  cstcDataSource: any = new MatTableDataSource();
  categoryDataSource: any = new MatTableDataSource();
  compnayTargetDataSource: any = new MatTableDataSource();

  private subscriptions = new Subscription();


  constructor(
    private _profileService: ProfileService,
    public dialog: MatDialog,
    private _employeeService: EmployeeService,
    private _toast: ToastrService
  ) { }



  ngOnInit() {
    const employee = this._employeeService.employeeToken()
    if (employee) {
      const employeeId = employee.employeeId
      this._employeeService.getEmployeeData(employeeId);
    }

    this.subscriptions.add(
      this._employeeService.employeeData$.subscribe((employee) => {
        this.privileges = employee?.category?.privileges;

        if (this.privileges?.portalManagement?.companyTarget) {
          this.subscriptions.add(
            this._profileService.getCompanyTargets().subscribe((data) => {
              if (data) {
                this.compnayTargetDataSource.data = this.expandData(data.targets)
                this.compnayTargetDataSource._updateChangeSubscription()
                this.isTargetEmpty = false;
              } else {
                this.isTargetEmpty = true;
              }
              this.isTargetLoading = false;
            })
          )
        }

        if (this.privileges?.portalManagement?.department) {
          this.subscriptions.add(
            this._profileService.getDepartments().subscribe((data) => {
              if (data) {
                this.departmentDataSource.data = data
                this.isDepartmentLoading = false
              }
            })
          )
        }


        if (this.privileges?.portalManagement?.department) {
          this.subscriptions.add(
            this._profileService.getCustomerDepartments().subscribe((data) => {
              if (data) {
                this.customerDepartmentDataSource.data = data
                this.isCustomerDepartmentLoading = false
              }
            })
          )
        }

        if (this.privileges?.portalManagement?.notesAndTerms) {
          this.subscriptions.add(
            this._profileService.getNotes().subscribe((data) => {
              if (data) {
                this.cstcDataSource.data = [data]
              }
              this.isNotesLoading = false
            })
          )
        }

        if (employee?.category.role == 'superAdmin') {
          this.categorySection = true
          this.subscriptions.add(
            this._employeeService.getCategory().subscribe((data) => {
              if (data) {
                this.categoryDataSource.data = data
                this.isCategoryLoading = false
              }
            })
          )
        }

      })
    )
  }


  onCreateDepartment() {
    const dialogRef = this.dialog.open(CreateDepartmentDialog, {
      data: { forCustomer: false }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        data.departmentHead = [data.departmentHead]
        this.departmentDataSource.data = [...this.departmentDataSource.data, data]
      }
    });
  }

  onCreateCustomerDepartment() {
    const dialogRef = this.dialog.open(CreateDepartmentDialog, {
      data: { forCustomer: true }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        data.departmentHead = [data.departmentHead]
        this.customerDepartmentDataSource.data = [...this.customerDepartmentDataSource.data, data];
        this.customerDepartmentDataSource._updateChangeSubscription()
      }
    });
  }

  onNoteForm(action: string, note?: string, noteId?: string) {
    const dialogRef = this.dialog.open(NoteFormComponent, {
      data: { action, note, noteId }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.cstcDataSource.data = [data]
      }
    });
  }

  onEditClick(index: number) {
    let department = this.departmentDataSource.data[index]
    if (department) {
      const dialogRef = this.dialog.open(CreateDepartmentDialog, { data: { forCustomer: false, department } });
      dialogRef.afterClosed().subscribe(data => {
        if (data) {
          data.departmentHead = [data.departmentHead]
          this.departmentDataSource.data[index] = data
          this.departmentDataSource.data = [...this.departmentDataSource.data]
        }
      })
    }
  }

  onEditCustomerClick(index: number) {
    let department = this.customerDepartmentDataSource.data[index]
    if (department) {
      const dialogRef = this.dialog.open(CreateDepartmentDialog, { data: { forCustomer: true, department } });
      dialogRef.afterClosed().subscribe(data => {
        if (data) {
          data.departmentHead = [data.departmentHead]
          this.customerDepartmentDataSource.data[index] = data
          this.customerDepartmentDataSource._updateChangeSubscription()
        }
      })
    }
  }

  onNoteDelete(noteType: string, noteId: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent,
      {
        data: {
          title: `Are you absolutely sure?`,
          description: `This action is irreversible. The note will be deleted.`,
          icon: 'heroExclamationCircle',
          IconColor: 'orange'
        }
      });

    dialogRef.afterClosed().subscribe((approved: boolean) => {
      if (approved) {
        this._profileService.deleteNote(noteType, noteId).subscribe((res) => {
          if (res.success) {
            let noteData = this.cstcDataSource.data[0];
            if (noteType === "customerNotes" || noteType === "termsAndConditions") {
              const index = noteData[noteType].findIndex((note: any) => note._id === noteId);
              if (index !== -1) {
                noteData[noteType].splice(index, 1);
              }
            }
            this.cstcDataSource.data = [noteData];
          }
        })
      }
    })
  }


  createCategory() {
    const dialogRef = this.dialog.open(CreateCategoryComponent, {
      width: '100vh'
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.categoryDataSource.data.push(data)
        this.categoryDataSource._updateChangeSubscription();

        this._toast.success('Category Created Successfully')
      }
    });
  }

  editCategory(data: GetCategory, index: number) {
    const dialogRef = this.dialog.open(EditCategoryComponent, {
      width: '100vh',
      data: data
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.categoryDataSource.data[index] = data;
        this.categoryDataSource._updateChangeSubscription();

        this._toast.success('Category Updated Successfully')
      }
    });
  }

  addCompanyTarget() {
    const dialogRef = this.dialog.open(SetTargetComponent);
    dialogRef.afterClosed().subscribe((data: Target) => {
      if (data) {
        this._profileService.setCompanyTarget(data).subscribe({
          next: (res) => {
            this.compnayTargetDataSource.data = this.expandData(res);
            this.compnayTargetDataSource._updateChangeSubscription()
          },
          error: (error) => {
            this._toast.warning(error.error.message)
          }
        })
      }
    })
  }

  editTarget(id: string) {

    const target = this.targets.find(target => target._id == id)
    const dialogRef = this.dialog.open(SetTargetComponent, {
      data: target
    });
    dialogRef.afterClosed().subscribe((data: Target) => {
      if (data) {
        this._profileService.updateCompanyTarget(id, data).subscribe({
          next: (res) => {
            this.compnayTargetDataSource.data = this.expandData(res);
            this.compnayTargetDataSource._updateChangeSubscription()
          },
          error: (error) => {
            console.log(error);

            this._toast.warning(error.error.message)
          }
        })
      }
    })
  }

  expandData(data: Target[]) {
    this.targets = data;
    return data.flatMap((element) => [
      {
        year: element.year,
        _id: element._id,
        targetType: 'Sales Revenue',
        criticalRange: element.salesRevenue.criticalRange,
        targetValue: element.salesRevenue.targetValue,
        moderateRange: element.salesRevenue.moderateRange,
        isFirstRow: true,
        rowspan: 2
      },
      {
        targetType: 'Gross Profit',
        criticalRange: element.grossProfit.criticalRange,
        targetValue: element.grossProfit.targetValue,
        moderateRange: element.grossProfit.moderateRange,
        isFirstRow: false
      }
    ]);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe()
  }
}

