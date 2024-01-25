import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { celebCheckService } from './core/services/celebrationCheck/celebCheck.service';
import { announcementGetData } from './shared/interfaces/announcement.interface';
import { interval } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CelebrationDialogComponent } from './shared/components/celebration-dialog/celebration-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';
  birthdaysViewed!: boolean;
  reduceSate: boolean = true;

  constructor(private route: ActivatedRoute, private _service: celebCheckService, private dialog: MatDialog) { }

  ngOnInit() {
    this.getCelebData();
  }

  reduceSideBar(event: boolean) {
    this.reduceSate = event;
  }

  isLoginRoute(): boolean {
    return this.route.snapshot.firstChild?.routeConfig?.path === 'login';
  }

  getCelebData() {
    this.birthdaysViewed = this._service.hasTodaysBirthdaysBeenViewed();

    if (this.birthdaysViewed == true) {
      this._service.getCelebrationData().subscribe((data) => {
        if (data && data.length > 0) {
          this.openCelebrationDialog(data);
          this._service.markTodaysBirthdaysAsViewed();
        }
      });
    }

    interval(1000 * 60).subscribe(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        this._service.clearTodaysBirthdaysViewedFlag();
        this.birthdaysViewed = false;
      }
    });
  }

  openCelebrationDialog(data: announcementGetData[]): void {
    this.dialog.open(CelebrationDialogComponent, {
      data: data,
      width: '400px',
      height: '400px',
    });
  }

  clearTodaysBirthdaysViewedFlag() {
    this._service.clearTodaysBirthdaysViewedFlag();
    this.birthdaysViewed = false;
  }
}
