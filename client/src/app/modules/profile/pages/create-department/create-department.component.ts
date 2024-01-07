import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-create-department',
  templateUrl: './create-department.component.html',
  styleUrls: ['./create-department.component.css']
})
export class CreateDepartmentDialog implements OnInit, OnDestroy {

  employeeList: { name: string, id: string | undefined }[] = []
  enableSubmit: boolean = false
  newDepartment: boolean = true

  private _subscriptions = new Subscription();

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
      this.newDepartment = false
      this.name.disable()
      this.name.setValue(this.data.departmentName)
      this.head.setValue(this.data.departmentHead[0].userName)
    }
    this._subscriptions.add(this._employeeService.getEmployees().subscribe((data: getEmployee[]) => {
      if (data.length > 0) {
        data.forEach((val) => this.employeeList.push({ name: val.userName, id: val._id }))
      }
    }))
  }

  onCloseClicked() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.name.value && this.head.value) {
      this._subscriptions.add(this._profileService.setDepartment(
        { departmentName: this.name.value, departmentHead: this.head.value, createdDate: Date.now() })
        .subscribe((data) => {
          if (data) {
            this.dialogRef.close(data)
          }
        }))
    }
  }

  onUpdate() {
    let curHead = this.data.departmentHead[0].userName
    if (this.head.value && this.head.value != curHead) {
      this._subscriptions.add(this._profileService.updateDepartment(
        { departmentName: this.data.departmentName, departmentHead: this.head.value, createdDate: this.data.createdDate })
        .subscribe(data => {
          if (data) {
            this.dialogRef.close(data)
          }
        }))
    }
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe()
  }
}
