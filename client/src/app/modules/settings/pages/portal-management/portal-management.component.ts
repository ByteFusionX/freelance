import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CreateDepartmentDialog } from '../create-department/create-department.component';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { NoteFormComponent } from '../note-form/note-form.component';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { CreateCategoryComponent } from 'src/app/modules/home/pages/employees/create-category/create-category.component';
import { ToastrService } from 'ngx-toastr';
import { EditCategoryComponent } from '../edit-category/edit-category.component';
import { GetCategory, Privileges } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-portal-management',
  templateUrl: './portal-management.component.html',
  styleUrls: ['./portal-management.component.css']
})
export class PortalManagementComponent {
  privileges!: Privileges | undefined;

  openCreateForm: boolean = false;
  isDepartmentLoading: boolean = true
  isNotesLoading: boolean = true
  isCategoryLoading: boolean = true;
  categorySection: boolean = false;

  departmentDisplayedColumns: string[] = ['position', 'name', 'head', 'date', 'action'];
  cstcDisplayedColumns: string[] = ['customerNote', 'termsCondition'];
  categoryDisplayedColumns: string[] = ['slNo', 'categoryName', 'role', 'count', 'action'];

  departmentDataSource: any = new MatTableDataSource();
  cstcDataSource: any = new MatTableDataSource();
  categoryDataSource: any = new MatTableDataSource();

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
        console.log(employee)
        this.privileges = employee?.category?.privileges;
        console.log(this.privileges)
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

        if (this.privileges?.portalManagement?.notesAndTerms) {
          this.subscriptions.add(
            this._profileService.getNotes().subscribe((data) => {
              if (data) {
                this.cstcDataSource.data = [data]
                console.log(this.cstcDataSource.data)
                this.isNotesLoading = false
              }
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


  onCreateClicks() {
    const dialogRef = this.dialog.open(CreateDepartmentDialog);
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        data.departmentHead = [data.departmentHead]
        this.departmentDataSource.data = [...this.departmentDataSource.data, data]
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
      const dialogRef = this.dialog.open(CreateDepartmentDialog, { data: department });
      dialogRef.afterClosed().subscribe(data => {
        if (data) {
          data.departmentHead = [data.departmentHead]
          this.departmentDataSource.data[index] = data
          this.departmentDataSource.data = [...this.departmentDataSource.data]
        }
      })
    }
  }

  onNoteDelete(noteType: string, noteId: string) {
    console.log(this.cstcDataSource.data)
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


  ngOnDestroy() {
    this.subscriptions.unsubscribe()
  }
}
