import { Component, OnDestroy, OnInit, AfterViewInit, Renderer2, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAnnouncementComponent } from './add-announcement/add-announcement.component';
import { AnnouncementService } from 'src/app/core/services/announcement/announcement.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { announcementGetData } from 'src/app/shared/interfaces/announcement.interface';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent implements OnDestroy, OnInit {
  createAnnouncement: boolean | undefined = false;
  mySubscription!: Subscription;
  announcementData: announcementGetData[] = [];
  recentData!: announcementGetData;
  isLoading: boolean = true;
  isEmpty: boolean = false;
  total: number = 0;
  page: number = 1;
  row: number = 10;

  private subject = new BehaviorSubject<{ page: number, row: number }>({ page: this.page, row: this.row });

  @ViewChildren('announcementItem') announcementItems!: QueryList<ElementRef>;

  constructor(
    public dialog: MatDialog,
    private _service: AnnouncementService,
    private toaster: ToastrService,
    private _employeeService: EmployeeService,
    private renderer: Renderer2
  ) { }

  userId: any = null


  ngOnInit(): void {
    this.checkPermission();
    this.mySubscription =
      this.subject.subscribe((data) => {
        this.page = data.page;
        this.row = data.row;
        this.getAnnouncementData();
      });

      // this.userId = this._employeeService.employeeData$
  }

  // ngAfterViewInit() {
  //   this.announcementItems.changes.subscribe(() => {
  //     this.announcementItems.forEach(item => {
  //       this.observeAnnouncement(item);
  //     });
  //   });
  // }

  openDialog() {
    const dialogRef = this.dialog.open(AddAnnouncementComponent);

    this.mySubscription = dialogRef.afterClosed().subscribe(result => {
      this.getAnnouncementData();
      this.toaster.success('Announcement added!', 'Success');
    });
  }

  getAnnouncementData() {
    this.mySubscription = this._service.getAnnouncement(this.page, this.row).subscribe((res: { total: number, announcements: announcementGetData[] }) => {
      if (res.announcements.length) {
        this.isLoading = false;
        this.announcementData = res.announcements;
        this.total = res.total;
        if (this.announcementData.length > 0) {
          this.recentData = this.announcementData[0];
          this.announcementData.shift();
        } else {
          this.isEmpty = true;
        }
      }
    }, (error) => {
      this.isEmpty = true;
    });
  }

  // observeAnnouncement(element: ElementRef) {
  //   const options = {
  //     root: null,
  //     rootMargin: '0px',
  //     threshold: 1.0
  //   };

  //   const observer = new IntersectionObserver((entries) => {
  //     entries.forEach(entry => {
  //       if (entry.isIntersecting) {
  //         const announcementId = entry.target.getAttribute('data-id');
  //         this.markAsViewed(announcementId);
  //         observer.unobserve(entry.target);
  //       }
  //     });
  //   }, options);

  //   observer.observe(element.nativeElement);
  // }

  // markAsViewed(announcementId: string | null) {
  //   if (announcementId) {
  //     this._service.markAsViewed(announcementId, this.userId.id).subscribe((updatedAnnouncement: any) => {
  //       const index = this.announcementData.findIndex(a => a._id === updatedAnnouncement._id);
  //       if (index !== -1) {
  //         this.announcementData[index] = updatedAnnouncement;
  //       }
  //     });
  //   }
  // }

  trackByIdFn(index: number, item: announcementGetData): string {
    return item._id;
  }

  checkPermission() {
    this.mySubscription = this._employeeService.employeeData$.subscribe((data) => {
      this.createAnnouncement = data?.category.privileges.announcement.create;
    });
  }

  ngOnDestroy(): void {
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }

  onPageNumberClick(event: { page: number, row: number }) {
    this.subject.next(event);
  }
}
