import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEmployeeDialog } from './create-employee/create-employee.component';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent {
  
  constructor(public dialog: MatDialog) {}

  displayedColumns: string[] = ['name', 'department', 'email', 'contactNo','privilage'];

  dataSource = [
    {name: 'Basim', department: 'department#1', email: 'basimohammed@gmail.com', contactNo: 949494949494},
    {name: 'Basim', department: 'department#1', email: 'basimohammed@gmail.com', contactNo: 949494949494},
    {name: 'Basim', department: 'department#1', email: 'basimohammed@gmail.com', contactNo: 949494949494},
    {name: 'Basim', department: 'department#1', email: 'basimohammed@gmail.com', contactNo: 949494949494},
    {name: 'Basim', department: 'department#1', email: 'basimohammed@gmail.com', contactNo: 949494949494},
    {name: 'Basim', department: 'department#1', email: 'basimohammed@gmail.com', contactNo: 949494949494},
    {name: 'Basim', department: 'department#1', email: 'basimohammed@gmail.com', contactNo: 949494949494},
    {name: 'Basim', department: 'department#1', email: 'basimohammed@gmail.com', contactNo: 949494949494},
    {name: 'Basim', department: 'department#1', email: 'basimohammed@gmail.com', contactNo: 949494949494},
    {name: 'Basim', department: 'department#1', email: 'basimohammed@gmail.com', contactNo: 949494949494},
    {name: 'Basim', department: 'department#1', email: 'basimohammed@gmail.com', contactNo: 949494949494},
    {name: 'Basim', department: 'department#1', email: 'basimohammed@gmail.com', contactNo: 949494949494},
  ];

  openDialog(){
    const dialogRef = this.dialog.open(CreateEmployeeDialog);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
