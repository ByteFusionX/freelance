import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-select-employee',
  templateUrl: './select-employee.component.html',
  styleUrls: ['./select-employee.component.css']
})
export class SelectEmployeeComponent {

  employees$!: Observable<getEmployee[]>
  selectedEmployee!:string;

  constructor(
    private dialogRef: MatDialogRef<SelectEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private _employeeService: EmployeeService,
  ) { }

  ngOnInit(){
    this.employees$ = this._employeeService.getAllEmployees()
  }

  onClose() {
    this.dialogRef.close()
  }

  onSubmit(){
    if(this.selectedEmployee){
      this.dialogRef.close(this.selectedEmployee)
    }
  }

}
