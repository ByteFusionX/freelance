import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent{

  reduceSate: boolean = true

  // constructor(private router: Router) { }
  // ngOnInit(): void {
  //   console.log(this.router.url);
  // }

  reduceSideBar(event: boolean) {
    this.reduceSate = event
  }
}
