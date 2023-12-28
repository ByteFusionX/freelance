import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css'],
})
export class ProfileInfoComponent {

  @ViewChild('search') searchElement!: ElementRef
  @ViewChild('select') selectElement!: ElementRef
  @ViewChild('input') inputElement!: HTMLInputElement

  emplyeeList: { name: string }[] = [{ name: 'Chandler' }, { name: 'Ross' }, { name: 'Joe' }]
  openSelectField: boolean = false
  openCreateForm: boolean = false

  onSelectClick() {
    this.openSelectField = !this.openSelectField
    if (this.openSelectField) {
      setTimeout(() => { this.searchElement.nativeElement.focus() }, 100)
    }
  }

  onCloseClicked(){
    this.openCreateForm = false
    this.openSelectField = false
  }

  onEmployeeSelect(event: Event) {
    let selectedName = (event.target as HTMLElement).innerHTML
    this.selectElement.nativeElement.innerHTML = selectedName
    this.openSelectField = false
  }

  onSearchName(event:Event){
    let searching = (event.target as HTMLInputElement).value
  }

  onSubmit(input: HTMLInputElement, select: HTMLElement) {
    let departmentName = input.value
    let departmentHead = select.innerHTML
    let department = { name: departmentName, head: departmentHead }
  }
}
