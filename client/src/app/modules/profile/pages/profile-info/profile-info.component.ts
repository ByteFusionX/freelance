import { AfterViewInit, Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CreateDepartmentDialog } from '../create-department/create-department.component';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css'],
})
export class ProfileInfoComponent implements AfterViewInit {

  depName!: string;
  depHead!: string;
  optionSelected!: string;
  openCreateForm: boolean = false

  displayedColumns: string[] = ['position', 'name', 'head', 'date', 'action'];
  dataSource: any = new MatTableDataSource()

  constructor(private _profileService: ProfileService, public dialog: MatDialog) { }

  ngAfterViewInit() {
    this._profileService.getDepartments().subscribe((data) => {
      if (data) {
        this.dataSource.data = data
      }
    })
  }

  onCreateClicks() {
    const dialogRef = this.dialog.open(CreateDepartmentDialog);
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        data.departmentHead = [data.departmentHead]
        this.dataSource.data = [...this.dataSource.data, data]
      }
    });
  }

  onEditClick(index: number) {
    let department = this.dataSource.data[index]
    if (department) {
      const dialogRef = this.dialog.open(CreateDepartmentDialog, { data: department });
      dialogRef.afterClosed().subscribe(data => {
        if (data) {
          data.departmentHead = [data.departmentHead]
          console.log(data);
          
          this.dataSource.data[index] = data
          this.dataSource.data = [...this.dataSource.data]
        }
      })
    }
  }
}
