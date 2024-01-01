import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css'],
})
export class ProfileInfoComponent {

  depName!: string;
  optionSelected!: string;
  openCreateForm: boolean = false
  employeeList = [{ name: 'Chandler' }, { name: 'Ross' }, { name: 'Joe' }]

  onCloseClicked() {
    this.openCreateForm = false
  }

  onInputValues(event:Event){
    this.depName = (event.target as HTMLInputElement).value
  }

  onOptionSelected(event: string) {
    this.optionSelected = event
  }

  onSubmit() {
    let depName = this.depName
    let depHead = this.optionSelected
    let department = { name: depName, head: depHead }
  }
}
