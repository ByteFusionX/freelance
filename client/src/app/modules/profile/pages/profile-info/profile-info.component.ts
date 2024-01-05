import { AfterViewInit, Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css'],
})
export class ProfileInfoComponent implements DoCheck, AfterViewInit, OnInit {
  
  depName!: string;
  depHead!: string;
  optionSelected!: string;
  openCreateForm: boolean = false
  employeeList: { name: string, id: string | undefined }[] = []
  enableSubmit: boolean = false

  displayedColumns: string[] = ['position', 'name', 'head', 'date', 'action'];
  dataSource: any = new MatTableDataSource()

  constructor(private _profileService: ProfileService, private _employeeService: EmployeeService) { }
  ngOnInit(): void {
    this._employeeService.getEmployees().subscribe((data: getEmployee[]) => {
      if (data.length > 0) {
        data.forEach((val) => this.employeeList.push({ name: val.userName, id: val._id }))
      }
    })
  }

  ngDoCheck(): void {
    if (this.depName && this.optionSelected) {
      this.enableSubmit = true
    } else {
      this.enableSubmit = false
    }
  }

  ngAfterViewInit() {
    this._profileService.getDepartments().subscribe((data) => {
      if (data) {
        this.dataSource.data = data
      }
    })
  }

  onCloseClicked() {
    this.openCreateForm = false
  }

  onInputValues(event: Event) {
    this.depName = (event.target as HTMLInputElement).value
  }

  // onOptionSelected(event: string) {
  //   this.optionSelected = event
  // }

  onSubmit() {
    // let depHead = this.optionSelected
    if (this.depName && this.depHead) {
      let department = { departmentName: this.depName, departmentHead: this.depHead, createdDate: Date.now() }
      this._profileService.setDepartment(department).subscribe((data) => {
        if (data) {
          this.onCloseClicked()
          data.departmentHead = [data.departmentHead]
          this.dataSource.data.push(data)
          this.dataSource.data = this.dataSource.data
        }
      })
    }
  }
  
  onEditClick(index: number) {
    let department = this.dataSource.data[index]
    console.log(department);
    
  }
}
