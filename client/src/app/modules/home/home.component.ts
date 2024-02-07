import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent{

  reduceSate: boolean = true

  reduceSideBar(event: boolean) {
    this.reduceSate = event
  }
}
