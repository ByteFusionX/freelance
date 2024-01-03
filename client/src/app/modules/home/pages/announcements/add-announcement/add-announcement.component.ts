import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { announcementData } from 'src/app/core/services/announcement/announcement.interface';
import { AnnouncementService } from 'src/app/core/services/announcement/announcement.service';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { CreateCustomerDialog } from 'src/app/modules/customers/pages/create-customer/create-customer.component';
import { directiveSharedModule } from 'src/app/shared/directives/directives.module';

@Component({
  selector: 'app-add-announcement',
  templateUrl: './add-announcement.component.html',
  styleUrls: ['./add-announcement.component.css'],
  standalone: true,
  imports: [CommonModule, IconsModule, directiveSharedModule, ReactiveFormsModule, FormsModule],
})
export class AddAnnouncementComponent {
  constructor(public dialogRef: MatDialogRef<CreateCustomerDialog>, private fb: FormBuilder, private _service: AnnouncementService) { }

  onClose(): void {
    this.dialogRef.close();
  }
  formData = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    date: [new FormControl()]
  })

  data: announcementData = {
    title: this.formData.value.title as string,
    description: this.formData.value as string,
    date: this.formData.value.date as Date
  }

  onSubmit() {
    if (this.formData.valid) {
      this._service.createAnnouncement(this.data).subscribe((res: boolean) => {
        console.log(res)
      })
    }

  }
}
