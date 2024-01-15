import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { fileEnterState } from '../enquiry-animations';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { Observable } from 'rxjs';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-assign-presale',
  templateUrl: './assign-presale.component.html',
  styleUrls: ['./assign-presale.component.css'],
  animations: [fileEnterState],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignPresaleComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFiles: File[] = []
  employees$!: Observable<getEmployee[]>
  selectedEmployee!: string;

  constructor(
    public dialogRef: MatDialogRef<AssignPresaleComponent>,
    private _employeeService: EmployeeService,
  ) { }

  ngOnInit(): void {
    this.employees$ = this._employeeService.getEmployees()
  }

  onClose() {
    this.dialogRef.close()
  }

  onChange(change: string) {
    this.selectedEmployee = change
  }
  
  onFileSelected(event: any) {
    let files = event.target.files
    for (let i = 0; i < files.length; i++) {
      const newFile = files[i]
      const exist = this.selectedFiles.some(file=> file.name === newFile.name)
      if(!exist){
        this.selectedFiles.push(files[i])
      }
    }
  }


  onFileRemoved(index: number) {
    this.selectedFiles.splice(index, 1)
    this.fileInput.nativeElement.value = '';
  }

  onSubmit() {
    if (this.selectedFiles && this.selectedEmployee) {
      let presale = { presalePerson: this.selectedEmployee, presaleFile: this.selectedFiles }
      this.dialogRef.close(presale)
    }
  }
}
