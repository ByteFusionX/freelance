import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIconsModule } from '@ng-icons/core';
import { appFileValidator } from '../../directives/file-validator.directive';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css'],
  standalone: true,
  imports: [CommonModule, NgIconsModule, MatTooltipModule],
  providers: [appFileValidator]
})
export class UploadFileComponent {

  @Output() fileUpload = new EventEmitter<File[]>()
  @ViewChild('fileInput') fileInput!: ElementRef;

  @Input() selectedFiles: File[] = []

  onFileSelected(event: any) {
    let files = event.target.files
    for (let i = 0; i < files.length; i++) {
      const newFile = files[i]
      const exist = this.selectedFiles.some(file => file.name === newFile.name)
      if (!exist) {
        this.selectedFiles.push(files[i])
      }
    }
    this.onUpload()
  }

  onUpload() {
    this.fileUpload.emit(this.selectedFiles)
  }

  onFileRemoved(index: number) {
    this.selectedFiles.splice(index, 1)
    this.fileInput.nativeElement.value = '';
    this.onUpload()
  }
}
