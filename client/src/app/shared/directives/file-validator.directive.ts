import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Directive({
  selector: '[appImageFileValidator]'
})
export class appImageFileValidator {

  @Input() allowedExtensions: string[] = ['.jpg', '.jpeg', '.png', '.bmp' , '.gif'];

  constructor(private el: ElementRef, private toast: ToastrService) {}

  @HostListener('change') onChange() {
    const fileInput = this.el.nativeElement;
    const filePath = fileInput.value;

    const isValid = this.allowedExtensions.some(ext => filePath.toLowerCase().endsWith(ext));

    if (isValid) {
      fileInput.value = '';
      this.toast.warning('Invalid file type. Please upload an file with one of the following extensions: .pdf, .doc,', "Warning")
    }
  }
}