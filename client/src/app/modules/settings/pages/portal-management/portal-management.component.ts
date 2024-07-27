import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CreateDepartmentDialog } from '../create-department/create-department.component';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { NoteFormComponent } from '../note-form/note-form.component';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-portal-management',
  templateUrl: './portal-management.component.html',
  styleUrls: ['./portal-management.component.css']
})
export class PortalManagementComponent {

  openCreateForm: boolean = false
  isDepartmentLoading: boolean = true
  isNotesLoading: boolean = true

  departmentDisplayedColumns: string[] = ['position', 'name', 'head', 'date', 'action'];
  cstcDisplayedColumns: string[] = ['customerNote', 'termsCondition'];
  departmentDataSource: any = new MatTableDataSource()
  cstcDataSource: any = new MatTableDataSource()
  private subscriptions = new Subscription();

  constructor(private _profileService: ProfileService,
    public dialog: MatDialog,
    private _employeeService: EmployeeService) { }

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
          if(res.success){
            let noteData = this.cstcDataSource.data[0];
            if (noteType === "customerNotes" || noteType === "termsAndConditions") {
              const index = noteData[noteType].findIndex((note:any) => note._id === noteId);
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


  ngAfterViewInit() {
    this.subscriptions.add(
      this._profileService.getDepartments().subscribe((data) => {
        if (data) {
          this.departmentDataSource.data = data
          this.isDepartmentLoading = false
        }
      })
    )

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

  ngOnDestroy() {
    this.subscriptions.unsubscribe()
  }
}
