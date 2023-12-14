import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { sideBarState, dropDownMenuSate, buttonSlideState } from './side-bar.animation';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
  animations: [sideBarState, dropDownMenuSate, buttonSlideState]
})
export class SideBarComponent {

  @Input() showFullBar: boolean = true
  constructor(private _eref: ElementRef) { }

  @HostListener('document:click', ['$event.target'])
  onClick(event: HTMLElement) {
    if (!(this._eref.nativeElement.contains(event))) {
      this.homeDropDown = this.jobDropDown = false;
    }
  }

  homeDropDown: boolean = false
  jobDropDown: boolean = false

  onHomeClick() {
    this.homeDropDown = !this.homeDropDown
    this.jobDropDown = false
  }

  onJobClick() {
    this.jobDropDown = !this.jobDropDown
    this.homeDropDown = false
  }

}
