import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { CreateCustomerDialog } from 'src/app/modules/customers/pages/create-customer/create-customer.component';
import { datePastDirective } from 'src/app/shared/directives/date-validator.directive';
import { directiveSharedModule } from 'src/app/shared/directives/directives.module';

@Component({
  selector: 'app-add-announcement',
  templateUrl: './add-announcement.component.html',
  styleUrls: ['./add-announcement.component.css'],
  standalone: true,
  imports: [CommonModule, IconsModule, directiveSharedModule, ReactiveFormsModule, FormsModule],
})
export class AddAnnouncementComponent {
  constructor(public dialogRef: MatDialogRef<CreateCustomerDialog>, private fb: FormBuilder , private toast : ToastrService) { }

  onClose(): void {
    this.dialogRef.close();
  }
  formData = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    date: [''] 
  })

  toastCheck(){
    this.toast.warning('Invalid file type. Please upload an file with one of the following extensions: .pdf, .doc,', "Warning")
  }
}
