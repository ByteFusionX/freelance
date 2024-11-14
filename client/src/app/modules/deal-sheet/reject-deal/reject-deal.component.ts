import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-reject-deal',
  templateUrl: './reject-deal.component.html',
  styleUrls: ['./reject-deal.component.css']
})
export class RejectDealComponent {
  rejectForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RejectDealComponent>,
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
