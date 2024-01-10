import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-create-department',
  templateUrl: './create-department.component.html',
  styleUrls: ['./create-department.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateDepartmentDialog implements OnInit, OnDestroy {

  employeesList$!: Observable<getEmployee[]>
  enableSubmit: boolean = false
  newDepartment: boolean = true

  private subscriptions = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<CreateDepartmentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: getDepartment,
    private _employeeService: EmployeeService,
    private _profileService: ProfileService,
  ) { }

  name = new FormControl('');
  head = new FormControl('');

  ngOnInit(): void {
    this.head.setValue(null)
    if (this.data) {
      let fullName = this.data.departmentHead[0].firstName + ' ' + this.data.departmentHead[0].lastName
      this.newDepartment = false
      this.name.disable()
      this.name.setValue(this.data.departmentName)
      this.head.setValue(fullName)
    }
    this.employeesList$ = this._employeeService.getEmployees()
  }

  onCloseClicked() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.name.value && this.head.value) {
      this.subscriptions.add(this._profileService.setDepartment(
        { departmentName: this.name.value, departmentHead: this.head.value, createdDate: Date.now() })
        .subscribe((data) => {
          if (data) {
            this.dialogRef.close(data)
          }
        }))
    }
  }

  onUpdate() {
    let curHead = this.data.departmentHead[0].firstName + ' ' + this.data.departmentHead[0].lastName
    if (this.head.value && this.head.value != curHead) {
      this.subscriptions.add(this._profileService.updateDepartment(
        { departmentName: this.data.departmentName, departmentHead: this.head.value, createdDate: this.data.createdDate })
        .subscribe(data => {
          if (data) {
            this.dialogRef.close(data)
          }
        }))
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
}
