import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder,  FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import {  Subscription } from 'rxjs';

import { AnnouncementService } from 'src/app/core/services/announcement/announcement.service';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { CreateCustomerDialog } from 'src/app/modules/customers/pages/create-customer/create-customer.component';
import { directiveSharedModule } from 'src/app/shared/directives/directives.module';
import { announcementPostData } from 'src/app/shared/interfaces/announcement.interface';

@Component({
  selector: 'app-add-announcement',
  templateUrl: './add-announcement.component.html',
  styleUrls: ['./add-announcement.component.css'],
  standalone: true,
  imports: [CommonModule, IconsModule, directiveSharedModule, ReactiveFormsModule, FormsModule],
})
export class AddAnnouncementComponent implements OnDestroy {
  constructor(public dialogRef: MatDialogRef<CreateCustomerDialog>, private fb: FormBuilder, private _service: AnnouncementService ,  private toastr: ToastrService) { }


  private mySubscription!: Subscription;
  submit: boolean = false

  onClose(): void {
    this.dialogRef.close();
  }

  formData = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    date: [null, Validators.required]
  })



  onSubmit() {
    this.submit = true
    if (this.formData.valid) {
      const data: announcementPostData = {
        title: this.formData.value.title as string,
        description: this.formData.value.description as string,
        date: this.formData.value.date as Date | null
      }
      this.mySubscription = this._service.createAnnouncement(data).subscribe((res: boolean) => {
        if (res === true) {
          this.dialogRef.close()
        }
      })
    }else {
      this.toastr.warning('Check the fields properly!', 'Warning !')
    }
  }

  get f() {
    return this.formData.controls;
  }


  ngOnDestroy(): void {
    this.mySubscription.unsubscribe()
  }

}
