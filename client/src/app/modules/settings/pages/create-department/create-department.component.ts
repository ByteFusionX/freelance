import { IfStmt } from '@angular/compiler';
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
  nameError: boolean = false
  headError: boolean = false

  private subscriptions = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<CreateDepartmentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { forCustomer: boolean, department: getDepartment },
    private _employeeService: EmployeeService,
    private _profileService: ProfileService,
  ) { }

  name = new FormControl('');
  head = new FormControl('');

  ngOnInit(): void {
    this.head.setValue(null)
    if (this.data.department) {
      let fullName = this.data.department.departmentHead[0].firstName + ' ' + this.data.department.departmentHead[0].lastName
      this.newDepartment = false
      // this.name.disable()
      this.name.setValue(this.data.department.departmentName)
      this.head.setValue(fullName)
    }
    this.employeesList$ = this._employeeService.getAllEmployees()
  }

  onCloseClicked() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (!this.name.value) {
      this.nameError = true
      this.errorTimeout()
    }

    if (!this.head.value) {
      this.headError = true;
      this.errorTimeout();
      return
    }

    if (this.name.value && this.head.value && !this.data.forCustomer) {
      this.subscriptions.add(this._profileService.setDepartment(
        { departmentName: this.name.value, forCustomerContact: false, departmentHead: this.head.value, createdDate: Date.now() })
        .subscribe((data) => {
          if (data) {
            this.dialogRef.close(data)
          }
        }))
    } else if (this.name.value && this.data.forCustomer) {
      this.subscriptions.add(this._profileService.setDepartment(
        { departmentName: this.name.value, forCustomerContact: true, createdDate: Date.now() })
        .subscribe((data) => {
          if (data) {
            this.dialogRef.close(data)
          }
        }))
    }
  }

  onUpdate() {
    if (!this.name.value?.trim()) {
      this.nameError = true
      this.errorTimeout()
      return
    }

    if (!this.head.value) {
      this.headError = true;
      this.errorTimeout();
      return
    }

    let curName = this.data.department.departmentName
    let curHead = this.data.department.departmentHead[0].firstName + ' ' + this.data.department.departmentHead[0].lastName

    if (curHead == this.head.value) {
      this.head.setValue(<string>this.data.department.departmentHead[0]._id)
    }

    if (this.name.value?.trim() != curName || this.head.value != curHead && !this.data.forCustomer) {
      this.subscriptions.add(this._profileService.updateDepartment(
        { _id: this.data.department._id, departmentName: this.name.value, departmentHead: this.head.value, createdDate: this.data.department.createdDate, forCustomerContact: this.data.department.forCustomerContact })
        .subscribe(data => {
          if (data) {
            this.dialogRef.close(data)
          }
        }))
    } else if (this.name.value?.trim() != curName || this.head.value != curHead && this.data.forCustomer) {
      this.subscriptions.add(this._profileService.updateDepartment(
        { _id:this.data.department._id, departmentName: this.name.value, departmentHead: this.head.value, createdDate: this.data.department.createdDate, forCustomerContact: this.data.department.forCustomerContact })
        .subscribe(data => {
          if (data) {
            this.dialogRef.close(data)
          }
        }))
    }
  }

  errorTimeout() {
    setTimeout(() => {
      this.nameError = false
      this.headError = false
    }, 3000)
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
}
