import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-reassign-employee',
  templateUrl: './reassign-employee.component.html',
  styleUrls: ['./reassign-employee.component.css']
})
export class ReassignEmployeeComponent implements OnInit, OnDestroy {

  employees$!: Observable<getEmployee[]>;
  selectedEmployee!: string;
  private subscriptions = new Subscription()

  constructor(
    private dialogRef: MatDialogRef<ReassignEmployeeComponent>,
    private _employeeService: EmployeeService,
    @Inject(MAT_DIALOG_DATA) public data: { enquiryId: string },
    private _enquiryService: EnquiryService,
  ) { }

  ngOnInit() {
    this.employees$ = this._employeeService.getAllEmployees()
  }

  onClose() {
    this.dialogRef.close()
  }

  onSubmit() {
    this.subscriptions.add(
      this._enquiryService.reassignjob({ enquiryId: this.data.enquiryId, employeeId: this.selectedEmployee })
        .subscribe((res) => {
          if (res.message) {
            this.dialogRef.close({ message: res.message })
          }
        })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
}
