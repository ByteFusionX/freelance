import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.css'],
  standalone: true,
  imports: [CommonModule, NgIconsModule]

})
export class CustomSelectComponent implements OnChanges {

  @ViewChild('search') searchElement!: ElementRef
  @ViewChild('select') selectElement!: ElementRef

  @Input() options: any = []
  @Output() selectedOption = new EventEmitter<string>()
  openSelectField: boolean = false
  filterOptions: any[] = []

  constructor(private elem : ElementRef){}
  ngOnChanges(changes: SimpleChanges): void {
    this.filterOptions = [...this.options]
  }

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
    if (searching.trim()) {
      this.filterOptions = this.filterOptions.filter((data: any) => data.name.toLowerCase().includes(searching.toLowerCase()))
    } else {
      this.filterOptions = this.options
    }
  }

  @HostListener('document:click', ['$event.target'])
  onClick(event: HTMLElement) {
    if (!(this.elem.nativeElement.contains(event)) && this.openSelectField) {
      this.openSelectField = !this.openSelectField
    }
  }

}
