import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxExtendedPdfViewerComponent } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-quotation-preview',
  templateUrl: './quotation-preview.component.html',
  styleUrls: ['./quotation-preview.component.css']
})
export class QuotationPreviewComponent {
  @ViewChild(NgxExtendedPdfViewerComponent, { static: false })
  private pdfViewer!: NgxExtendedPdfViewerComponent;
  url:string = '';
  constructor(
    public dialogRef: MatDialogRef<QuotationPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
  ) {
    console.log(data)
    this.url = data;
    dialogRef.beforeClosed().subscribe((result) => {
      console.log('The dialog is about to be closed');
      // Here's the interesting bit:
      this.pdfViewer.ngOnDestroy();
    });
  }

  public onCloseClick(): void {
    this.dialogRef.close();
  }
}
