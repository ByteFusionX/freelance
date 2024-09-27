import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SalesTarget } from '../../interfaces/employee.interface';

@Component({
  selector: 'app-set-target',
  templateUrl: './set-target.component.html',
  styleUrls: ['./set-target.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SetTargetComponent {
  targetValue: number = 0;
  badRange!: number;
  moderateRange!: number;

  constructor(
    private dialogRef: MatDialogRef<SetTargetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SalesTarget,
  ) { }

  ngOnInit() {
    if (this.data) {
      this.targetValue = this.data.targetValue;
      this.badRange = this.data.badRange;
      this.moderateRange = this.data.moderateRange;
    }
  }

  submit() {
    if (this.targetValue > 0 && this.badRange <= this.targetValue && this.moderateRange <= this.targetValue || this.badRange > this.moderateRange) {
      this.dialogRef.close({
        targetValue: this.targetValue,
        badRange: this.badRange,
        moderateRange: this.moderateRange
      })
    }
  }

  cancel() {
    this.dialogRef.close()
  }
}
