import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApproveDealComponent } from '../approve-deal/approve-deal.component';

@Component({
  selector: 'app-reject-deal',
  templateUrl: './reject-deal.component.html',
  styleUrls: ['./reject-deal.component.css']
})
export class RejectDealComponent {
  rejectForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ApproveDealComponent>,
  ) {
    this.rejectForm = this.fb.group({
      comment: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.rejectForm.valid) {
      const comment = this.rejectForm.value.comment;
      this.dialogRef.close(comment)
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
