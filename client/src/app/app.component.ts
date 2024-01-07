import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'client';

  reduceSate: boolean = true
  reduceSideBar(event: boolean) {
    this.reduceSate = event
  }
}
