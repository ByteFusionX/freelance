import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Directive({
  selector: '[appFileValidator]'
})
export class appFileValidator {

  @Input() allowedExtensions: string[] = ['.jpg','.jpeg','.png','.pdf','.doc','.docx'];

  constructor(private el: ElementRef, private toast: ToastrService) {}

  @HostListener('change') onChange() {
    const fileInput = this.el.nativeElement;
    const filePath = fileInput.value;

    const isValid = this.allowedExtensions.some(ext => filePath.toLowerCase().endsWith(ext));

    if (!isValid) {
      fileInput.value = '';
      this.toast.warning('Upload a file with one of these extensions: .jpg, .jpeg, .png, .pdf, .doc, .docx.', "Warning")
    }
  }
}