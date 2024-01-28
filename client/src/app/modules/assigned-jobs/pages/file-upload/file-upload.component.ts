import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {

  selectedFiles: File[] = []
  constructor(private dialogRef: MatDialogRef<FileUploadComponent>) { }

  onClose() {
    this.dialogRef.close()
  }

  onUpload() {
    if(this.selectedFiles.length){
      this.dialogRef.close(this.selectedFiles)
    }
  }

  onFileUpload(event: File[]) {
    this.selectedFiles = event
  }
}
