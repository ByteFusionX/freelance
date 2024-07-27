import { Component } from '@angular/core';
import {  MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-give-feedback',
  templateUrl: './give-feedback.component.html',
  styleUrls: ['./give-feedback.component.css']
})
export class GiveFeedbackComponent {
  feedback!:string;
  constructor(
    public dialogRef: MatDialogRef<GiveFeedbackComponent>,
  ) {  }

  onSubmit(){
    if(this.feedback){
      this.dialogRef.close(this.feedback)
    }
  }

  onClose() {
    this.dialogRef.close()
  }
}
