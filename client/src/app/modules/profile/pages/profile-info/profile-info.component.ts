import { Component, DoCheck, OnInit } from '@angular/core';
import { ProfileService } from 'src/app/core/services/profile/profile.service';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css'],
})
export class ProfileInfoComponent implements DoCheck, OnInit {

  depName!: string;
  optionSelected!: string;
  openCreateForm: boolean = false
  employeeList = [{ name: 'Chandler' }, { name: 'Ross' }, { name: 'Joe' }]
  enableSubmit: boolean = false

  constructor(private _profileService: ProfileService) { }
  ngDoCheck(): void {
    if (this.depName && this.optionSelected) {
      this.enableSubmit = true
    } else {
      this.enableSubmit = false
    }
  }

  ngOnInit(): void {
    this._profileService.getDepartments().subscribe()
  }

  onCloseClicked() {
    this.openCreateForm = false
  }

  onInputValues(event: Event) {
    this.depName = (event.target as HTMLInputElement).value
  }

  onOptionSelected(event: string) {
    this.optionSelected = event
  }

  onSubmit() {
    let depName = this.depName
    let depHead = this.optionSelected
    let department = { name: depName, head: depHead, date: Date.now() }
    this._profileService.setDepartment(department)
  }
}
