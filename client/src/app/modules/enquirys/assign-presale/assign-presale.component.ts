import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fileEnterState } from '../enquiry-animations';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { Observable } from 'rxjs';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { TitleStrategy } from '@angular/router';

@Component({
  selector: 'app-assign-presale',
  templateUrl: './assign-presale.component.html',
  styleUrls: ['./assign-presale.component.css'],
  animations: [fileEnterState],
  encapsulation: ViewEncapsulation.None
})
export class AssignPresaleComponent implements OnInit {

  selectedFiles: File[] = []
  employees$!: Observable<getEmployee[]>
  selectedEmployee!: string | undefined;
  comment!: string;
  employeeError: boolean = false;
  fileError: boolean = false;
  commentError: boolean = false;
  isClear: boolean = false;
  isSaving: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AssignPresaleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { presalePerson: string, presaleFile: File[], comment: string },
    private _employeeService: EmployeeService,
  ) { }

  ngOnInit(): void {
    this.employees$ = this._employeeService.getAllEmployees()
    if (this.data) {
      this.selectedEmployee = this.data.presalePerson
      this.comment = this.data.comment
      this.selectedFiles = this.data.presaleFile
      this.isClear = true
    }
  }

  onClose() {
    this.dialogRef.close()
  }

  onChange(change: string) {
    this.selectedEmployee = change
    this.validateSalesPerson()
  }

  onFileUpload(event: File[]) {
    this.validateFile()
    this.selectedFiles = event
  }

  onSubmit() {
    let presalePersonName: String;
    this.isSaving = true;
    this.employees$.subscribe((employees) => {
      employees.forEach((employee) => {
        if (this.selectedEmployee == employee._id) {
          presalePersonName = `${employee.firstName} ${employee.lastName}`
        }
      })
      if (this.selectedEmployee && this.selectedFiles.length && presalePersonName && this.comment) {
        let presale = { presalePerson: this.selectedEmployee, presaleFile: this.selectedFiles, presalePersonName: presalePersonName, comment: this.comment }
        this.isSaving = false;
        this.dialogRef.close(presale)
      } else {
        this.isSaving = false;
        this.validateComment();
        this.validateFile();
        this.validateSalesPerson();
      }
    })
  }

  onClear() {
    this.selectedEmployee = undefined
    this.comment = ''
    this.selectedFiles = []
    this.dialogRef.close({ clear: true })
  }

  validateFile() {
    if (this.selectedFiles.length == 0) {
      this.fileError = true
    } else {
      this.fileError = false
    }
  }

  validateSalesPerson() {
    if (!this.selectedEmployee) {
      this.employeeError = true
    } else {
      this.employeeError = false
    }
  }

  validateComment() {
    if (!this.comment) {
      this.commentError = true;
    } else {
      this.commentError = false;
    }
  }
}
