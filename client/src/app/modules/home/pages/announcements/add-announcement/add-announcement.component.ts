import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AnnouncementService } from 'src/app/core/services/announcement/announcement.service';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { CreateCustomerDialog } from 'src/app/modules/customers/pages/create-customer/create-customer.component';
import { directiveSharedModule } from 'src/app/shared/directives/directives.module';
import { announcementGetData, announcementPostData } from 'src/app/shared/interfaces/announcement.interface';

@Component({
  selector: 'app-add-announcement',
  templateUrl: './add-announcement.component.html',
  styleUrls: ['./add-announcement.component.css'],
  standalone: true,
  imports: [CommonModule, IconsModule, directiveSharedModule, ReactiveFormsModule, FormsModule],
})
export class AddAnnouncementComponent implements OnDestroy, OnInit {
  submit: boolean = false;
  isSaving: boolean = false;
  userId!: any;
  isEdit: boolean = false;

  private mySubscription!: Subscription;

  constructor(
    public dialogRef: MatDialogRef<CreateCustomerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { data?: announcementGetData },
    private fb: FormBuilder,
    private _service: AnnouncementService,
    private toastr: ToastrService,
    private _employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this._employeeService.employeeData$.subscribe((res) => {
      this.userId = res;
    });

    if (this.data?.data) {
      this.isEdit = true;
      this.formData.patchValue({
        title: this.data.data.title,
        description: this.data.data.description,
        date: this.data.data.date
      });
    }
  }

  formData = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    date: [new Date(), Validators.required]
  });

  onSubmit() {
    this.submit = true;
    this.isSaving = true;
    
    if (this.formData.valid) {
      const data: announcementPostData = {
        title: this.formData.value.title as string,
        description: this.formData.value.description as string,
        date: this.formData.value.date as Date | null,
        userId: this.userId._id,
        isEdit: this.isEdit,
        _id: this.isEdit ? this.data.data?._id : undefined
      };

      this.mySubscription = this._service.createAnnouncement(data).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.toastr.success(res.message);
            this.dialogRef.close(true);
          }
        },
        error: (error) => {
          this.isSaving = false;
          this.toastr.error('Failed to save announcement');
        }
      });
    } else {
      this.isSaving = false;
      this.toastr.warning('Check the fields properly!', 'Warning !');
    }
  }

  get f() {
    return this.formData.controls;
  }

  onClose(): void {
    this.dialogRef.close();
  }


  ngOnDestroy(): void {
    this.mySubscription.unsubscribe()
  }

}
