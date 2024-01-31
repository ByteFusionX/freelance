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
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignPresaleComponent implements OnInit {

  selectedFiles: File[] = []
  employees$!: Observable<getEmployee[]>
  selectedEmployee!: string | undefined;
  employeeError: boolean = false;
  fileError: boolean = false;
  isClear: boolean = false

  constructor(
    public dialogRef: MatDialogRef<AssignPresaleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { presalePerson: string, presaleFile: File[] },
    private _employeeService: EmployeeService,
  ) { }

  ngOnInit(): void {
    this.employees$ = this._employeeService.getEmployees()
    if (this.data) {
      this.selectedEmployee = this.data.presalePerson
      this.selectedFiles = this.data.presaleFile
      this.isClear = true
    }
  }

  onClose() {
    this.dialogRef.close()
  }

  onChange(change: string) {
    this.selectedEmployee = change
  }

  onFileUpload(event: File[]) {
    this.selectedFiles = event
  }

  onSubmit() {
    if (this.selectedEmployee && this.selectedFiles.length) {
      let presale = { presalePerson: this.selectedEmployee, presaleFile: this.selectedFiles }
      this.dialogRef.close(presale)
    } else {
      this.Error()
    }
  }

  onClear() {
    this.selectedEmployee = undefined
    this.selectedFiles = []
    this.dialogRef.close({ clear: true })
  }

  Error() {
    if (this.selectedFiles.length == 0) {
      this.fileError = true
    }
    if (!this.selectedEmployee) {
      this.employeeError = true
    }
    setTimeout(() => {
      this.employeeError = false
      this.fileError = false
    }, 1000)
  }
}
