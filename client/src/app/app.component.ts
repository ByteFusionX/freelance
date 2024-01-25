import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  reduceSate: boolean = true;
  dialogRef: MatDialogRef<CelebrationDialogComponent, any> | undefined;
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private _service: celebCheckService, private dialog: MatDialog) { }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

    if (!this.birthdaysViewed) {
      this._service.getCelebrationData().subscribe((data) => {
        if (data && data.length > 0) {
          from(data).pipe(
            concatMap((item, index) => {
              return interval(1000 * index).pipe(
                take(1),
                switchMap(() => {
                  if (this.dialogRef) {
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

    interval(1000 * 60).pipe(takeUntil(this.destroy$)).subscribe(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        this._service.clearTodaysBirthdaysViewedFlag();
        this.birthdaysViewed = false;
      }
    });
  }

  openCelebrationDialog(data: announcementGetData): MatDialogRef<CelebrationDialogComponent, any> {
    return this.dialog.open(CelebrationDialogComponent, {
      data: data,
      width: '400px',
    });
  }

  clearTodaysBirthdaysViewedFlag() {
    this._service.clearTodaysBirthdaysViewedFlag();
    this.birthdaysViewed = false;
  }
}
