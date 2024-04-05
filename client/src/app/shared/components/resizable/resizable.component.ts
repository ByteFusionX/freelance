import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'th[resizable]',
  templateUrl: './resizable.component.html',
  styleUrls: ['./resizable.component.css']
})
export class ResizableComponent {
  constructor() { }
  @HostBinding('style.width.px')
  width: number | null = null;

  onResize(width: any) {
    this.width = width;
  }
}
