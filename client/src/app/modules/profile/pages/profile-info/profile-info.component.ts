import { AfterViewInit, Component, DoCheck } from '@angular/core';
import { MatTableDataSource, MatTableDataSourcePaginator } from '@angular/material/table';
import { ProfileService } from 'src/app/core/services/profile/profile.service';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css'],
})
export class ProfileInfoComponent implements DoCheck, AfterViewInit {

  depName!: string;
  optionSelected!: string;
  openCreateForm: boolean = false
  employeeList = [{ name: 'Chandler' }, { name: 'Ross' }, { name: 'Joe' }, { name: 'Peter' }]
  enableSubmit: boolean = false

  displayedColumns: string[] = ['position', 'name', 'head', 'date'];
  dataSource:any = new MatTableDataSource()

  constructor(private _profileService: ProfileService) { }
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
        console.log(this.dataSource);
      }
    })
  }

  onCloseClicked() {
    this.openCreateForm = false
  }

  onInputValues(event: Event) {
    this.depName = (event.target as HTMLInputElement).value
  }

  onOptionSelected(event: string) {
    this.optionSelected = event
  }

  onSubmit() {
    let depName = this.depName
    let depHead = this.optionSelected
    if (depName && depHead) {
      let department = { departmentName: depName, departmentHead: depHead, createdDate: Date.now() }
      this._profileService.setDepartment(department).subscribe((data) => {
        if(data == true){
          this.onCloseClicked()
          this.dataSource.data.push(department)
          this.dataSource.data = this.dataSource.data
        }
      })
    }
  }
}
