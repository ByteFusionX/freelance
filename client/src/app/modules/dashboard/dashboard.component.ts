import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  reduceSate: boolean = true

  reduceSideBar(event: boolean) {
    this.reduceSate = event
  }
}
