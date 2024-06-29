import { Component, OnDestroy, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAnnouncementComponent } from './add-announcement/add-announcement.component';
import { AnnouncementService } from 'src/app/core/services/announcement/announcement.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { announcementGetData } from 'src/app/shared/interfaces/announcement.interface';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent implements OnDestroy, OnInit, AfterViewInit {
  createAnnouncement: boolean | undefined = false;
  private readonly destroy$ = new Subject<void>(); // Subject to manage component lifecycle
  announcementData: announcementGetData[] = [];
  recentData: announcementGetData | null = null; // Allow recentData to be null
  isLoading: boolean = true;
  isEmpty: boolean = false;
  total: number = 0;
  page: number = 1;
  row: number = 10;
  userId!: any;

  private subject = new BehaviorSubject<{ page: number, row: number }>({ page: this.page, row: this.row });
  @ViewChildren('announcementItem') announcementItems!: QueryList<ElementRef>;

  private notViewedIds: Set<string> = new Set(); // Track IDs of not viewed announcements

  constructor(
    public dialog: MatDialog,
    private _service: AnnouncementService,
    private toaster: ToastrService,
    private _employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.checkPermission();
    this.subject.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.page = data.page;
      this.row = data.row;
      this.getAnnouncementData();
    });
  }

  ngAfterViewInit() {
    this.announcementItems.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.announcementItems.forEach(item => this.observeAnnouncement(item));
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(AddAnnouncementComponent);

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getAnnouncementData();
      this.toaster.success('Announcement added!', 'Success');
    });
  }

  getAnnouncementData() {
    this._service.getAnnouncement(this.page, this.row).pipe(takeUntil(this.destroy$)).subscribe(
      (res: { total: number, announcements: announcementGetData[] }) => {
        this.isLoading = false;
        this.announcementData = res.announcements;
        this.total = res.total;
        this.updateNotViewedIds();
        this.recentData = this.announcementData.shift() || null;
        this.isEmpty = this.announcementData.length === 0;
      },
      () => {
        this.isLoading = false;
        this.isEmpty = true;
      }
    );
  }

  observeAnnouncement(element: ElementRef) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const announcementId = entry.target.getAttribute('data-id');
          if (announcementId && this.notViewedIds.has(announcementId)) {
            this.markAsViewed(announcementId);
            this.notViewedIds.delete(announcementId);
          }
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px', threshold: 1.0 });

    if (element?.nativeElement) {
      observer.observe(element.nativeElement);
    }
  }

  markAsViewed(announcementId: string | null) {
    if (announcementId && this.userId) {
      this._service.markAsViewed(announcementId, this.userId).pipe(takeUntil(this.destroy$)).subscribe()
    }
  }

  updateNotViewedIds() {
    this.notViewedIds.clear();
    if (this.recentData && !this.recentData.viewedBy.includes(this.userId)) {
      this.notViewedIds.add(this.recentData._id);
    }
    this.announcementData.forEach(announcement => {
      if (!announcement.viewedBy.includes(this.userId)) {
        this.notViewedIds.add(announcement._id);
      }
    });
    
  }

  trackByIdFn(index: number, item: announcementGetData): string {
    return item._id;
  }

  checkPermission() {
    this._employeeService.employeeData$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.userId = data?._id;
      this.createAnnouncement = data?.category.privileges.announcement.create;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageNumberClick(event: { page: number, row: number }) {
    this.subject.next(event);
  }
}
