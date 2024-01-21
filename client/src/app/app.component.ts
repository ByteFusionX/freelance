import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { celebCheckService } from './core/services/celebrationCheck/celebCheck.service';
import { announcementGetData } from './shared/interfaces/announcement.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';
  celebData!: announcementGetData[]

  reduceSate: boolean = true
  reduceSideBar(event: boolean) {
    this.reduceSate = event
  }

  constructor(private route: ActivatedRoute, private _service: celebCheckService) { }

  isLoginRoute(): boolean {
    return this.route.snapshot.firstChild?.routeConfig?.path === 'login';
  }

  getCelebData() {
    this._service.getCelebrationData().subscribe((res) => {
      if (res.length) {
        this.celebData = res
      }
    })
  }
}
