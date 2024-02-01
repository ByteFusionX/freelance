import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { celebCheckService } from './core/services/celebrationCheck/celebCheck.service';
import { announcementGetData } from './shared/interfaces/announcement.interface';
import { concatMap, from, interval, take, switchMap, takeUntil } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CelebrationDialogComponent } from './shared/components/celebration-dialog/celebration-dialog.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'client';
  birthdaysViewed!: boolean;
  reduceState: boolean = true;
  loginRouter: boolean = false;
  dialogRef: MatDialogRef<CelebrationDialogComponent, any> | undefined;
  employeeToken: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private _service: celebCheckService, private dialog: MatDialog, private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loginRouter = this.isLoginRoute(); // Check if the current route is the login route
        if (!this.loginRouter) {
          this.getCelebData();
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit() {
    this.isUserThere();
  }

  reduceSideBar(event: boolean) {
    this.reduceState = event;
  }

  isLoginRoute(): boolean {
    return this.route.snapshot.firstChild?.routeConfig?.path === 'login';
  }

  isUserThere() {
    this.employeeToken = localStorage.getItem('employeeToken');
    this.getCelebData();
  }

  getCelebData() {
    if (this.employeeToken) {
      this.birthdaysViewed = this._service.hasTodaysBirthdaysBeenViewed();
      if (!this.birthdaysViewed) {
        this._service.getCelebrationData().subscribe((data) => {
          if (data && data.length > 0) {
            from(data).pipe(
              concatMap((item, index) => {
                return interval(1000 * index).pipe(
                  take(1),
                  switchMap(() => {
                    if (this.dialogRef && this.dialogRef.componentInstance) {
                      return this.dialogRef.afterClosed().pipe(
                        takeUntil(this.destroy$),
                        switchMap(() => {
                          this.dialogRef = this.openCelebrationDialog(item);
                          return [];
                        })
                      );
                    } else {
                      this.dialogRef = this.openCelebrationDialog(item);
                      return [];
                    }
                  })
                );
              }),
              takeUntil(this.destroy$)
            ).subscribe();
            this._service.markTodaysBirthdaysAsViewed();
          }
        });
      }
    }
  }

  openCelebrationDialog(data: announcementGetData): MatDialogRef<CelebrationDialogComponent, any> {
    return this.dialog.open(CelebrationDialogComponent, {
      data: data,
      width: '400px',
    });
  }
}
