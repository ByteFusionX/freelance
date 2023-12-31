import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.css'],
  standalone: true,
  imports: [CommonModule, NgIconsModule]

})
export class CustomSelectComponent {

  @ViewChild('search') searchElement!: ElementRef
  @ViewChild('select') selectElement!: ElementRef

  @Input() options: any = []
  @Output() selectedOption = new EventEmitter<string>()
  openSelectField: boolean = false

  onSelectClick() {
    this.openSelectField = !this.openSelectField
    if (this.openSelectField) {
      setTimeout(() => { this.searchElement.nativeElement.focus() }, 100)
    }
  }

  onEmployeeSelect(event: Event) {
    let selectedName = (event.target as HTMLElement).innerHTML
    this.selectElement.nativeElement.innerHTML = selectedName
    this.selectedOption.emit(selectedName)
    this.openSelectField = false
  }

  onSearchName(event: Event) {
    let searching = (event.target as HTMLInputElement).value
  }
}
