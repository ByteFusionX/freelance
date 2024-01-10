import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

  constructor(private route:ActivatedRoute){}

  isLoginRoute():boolean{
    return this.route.snapshot.firstChild?.routeConfig?.path === 'login';
  }
 
}
