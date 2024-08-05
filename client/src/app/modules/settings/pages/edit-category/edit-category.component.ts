import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { GetCategory, Privileges } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.css']
})
export class EditCategoryComponent {

  isSaving: boolean = false;
  error!: string;

  dashboardChecked: boolean = false;
  employeeChecked: boolean = false;
  announcementChecked: boolean = false;
  customerChecked: boolean = false;
  enquiryChecked: boolean = false;
  assignedJobsChecked: boolean = false;
  quotationChecked: boolean = false;
  jobSheetChecked: boolean = false;
  portalChecked: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<EditCategoryComponent>,
    private _fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: GetCategory,
    private _employeeService: EmployeeService,
  ) { }

  categoryForm = this._fb.group({
    categoryName: ['', Validators.required],
    role: ['', Validators.required],
    privileges: this._fb.group({
      dashboard: this._fb.group({
        viewReport: 'all',
        totalEnquiry: [false],
        totalQuote: [false],
        totalJobs: [false],
        totalPresale: [false],
        EnquiryChart: [false],
      }),
      employee: this._fb.group({
        viewReport: 'none',
        create: [false]
      }),
      announcement: this._fb.group({
        viewReport: 'none',
        create: [false]
      }),
      customer: this._fb.group({
        viewReport: 'none',
        create: [false]
      }),
      enquiry: this._fb.group({
        viewReport: 'none',
        create: [false]
      }),
      assignedJob: this._fb.group({
        viewReport: 'none'
      }),
      quotation: this._fb.group({
        viewReport: 'none',
        create: [false]
      }),
      jobSheet: this._fb.group({
        viewReport: 'none',
      }),
      portalManagement: this._fb.group({
        department: [false],
        notesAndTerms: [false]
      })
    })
  })

  ngOnInit() {
    this.updateChecks(this.data.privileges)
    console.log(this.data.privileges)
    this.categoryForm.patchValue(this.data)
    console.log(this.categoryForm.value)
  }

  updateChecks(privileges: Privileges) {
    this.dashboardChecked = privileges.dashboard.viewReport !== 'none',
      this.employeeChecked = privileges.employee.viewReport !== 'none',
      this.announcementChecked = privileges.announcement.viewReport !== 'none',
      this.customerChecked = privileges.customer.viewReport !== 'none',
      this.enquiryChecked = privileges.enquiry.viewReport !== 'none',
      this.assignedJobsChecked = privileges.assignedJob.viewReport !== 'none',
      this.quotationChecked = privileges.quotation.viewReport !== 'none',
      this.jobSheetChecked = privileges.jobSheet.viewReport !== 'none',
      this.portalChecked = privileges.portalManagement
        ? Object.values(privileges.portalManagement).some(value => value)
        : false;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onCheckboxChange(event: Event, formControlName: string, checkedVariable: keyof EditCategoryComponent): void {
    const eventTarget = event.target as HTMLInputElement;
    const checked = eventTarget.checked;

    if (checked) {
      this.categoryForm.patchValue({ privileges: { [formControlName]: { viewReport: 'all', create: false } } });
    } else {
      this.categoryForm.patchValue({ privileges: { [formControlName]: { viewReport: 'none', create: false } } });
    }

    this[checkedVariable] = checked as never;

  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.isSaving = true;

      const categoryData: GetCategory = this.categoryForm.value as GetCategory;

      this._employeeService.updateCategory(categoryData, this.data._id).subscribe({
        next: (data) => {
          this.isSaving = false;
          this.dialogRef.close(data)
        },
        error: ((error) => {
          this.isSaving = false;
          this.error = error.error;
        })
      })

    }
  }
}
