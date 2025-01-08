import { NgModule } from '@angular/core';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    ConfirmationDialogComponent
  ],
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  exports: [
    ConfirmationDialogComponent
  ]
})
export class SharedModule { } 