import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { celebCheckService } from './core/services/celebrationCheck/celebCheck.service';
import { announcementGetData } from './shared/interfaces/announcement.interface';
import { interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';
  celebData!: announcementGetData[]
  todaysBirthdays!: any[];
  birthdaysViewed!: boolean;


  reduceSate: boolean = true
  reduceSideBar(event: boolean) {
    this.reduceSate = event
  }

  constructor(private route: ActivatedRoute, private _service: celebCheckService) { }

  ngOnInit() {
    this.getCelebData()
  }
  isLoginRoute(): boolean {
    return this.route.snapshot.firstChild?.routeConfig?.path === 'login';
  }

  getCelebData() {
    this.todaysBirthdays = [];
    this.birthdaysViewed = this._service.hasTodaysBirthdaysBeenViewed();

    if (!this.birthdaysViewed) {
      this._service.getCelebrationData().subscribe((data) => {
        if (data.length) {
          this.todaysBirthdays = data;
        }
        this._service.markTodaysBirthdaysAsViewed();
      });
    }
    interval(1000 * 60)
      .subscribe(() => {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
          this._service.clearTodaysBirthdaysViewedFlag();
          this.birthdaysViewed = false;
        }
      });
  }

  clearTodaysBirthdaysViewedFlag() {
    this._service.clearTodaysBirthdaysViewedFlag();
    this.birthdaysViewed = false;
  }



}
