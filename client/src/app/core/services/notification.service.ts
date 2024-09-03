import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, Subject, switchMap, take } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { NotificationCounts } from 'src/app/shared/interfaces/notification.interface';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationsSubject = new BehaviorSubject<NotificationCounts>({ announcementCount: 0, assignedJobCount: 0, dealSheetCount: 0, feedbackCount: 0, quotationCount: 0, enquiryCount: 0 });
    notificationCounts$ = this.notificationsSubject.asObservable();
    api: string = environment.api

    constructor(
        private http: HttpClient,
        private socket: Socket
    ) { }

    initializeNotifications() {
        this.socket.fromEvent<string>('notifications').subscribe(
            {
                next: (notificationType) => {
                    this.incrementNotificationCount(notificationType);
                },
                error: (error) => {
                    console.error('Error receiving notifications:', error);
                }
            }
        );
    }

    private incrementNotificationCount(notificationType: string) {
        const currentCounts = this.notificationsSubject.value;

        const updatedCounts = { ...currentCounts };

        switch (notificationType) {
            case 'announcement':
                updatedCounts.announcementCount += 1;
                break;
            case 'assignedJob':
                updatedCounts.assignedJobCount += 1;
                break;
            case 'dealSheet':
                updatedCounts.dealSheetCount += 1;
                break;
            case 'feedbackRequest':
                updatedCounts.feedbackCount += 1;
                break;
            case 'quotation':
                updatedCounts.quotationCount += 1;
                break;
            case 'enquiry':
                updatedCounts.enquiryCount += 1;
                break;
        }

        this.notificationsSubject.next(updatedCounts);
    }

    decrementNotificationCount(notificationType: string, value: number) {
        const currentCounts = this.notificationsSubject.value;

        const updatedCounts = { ...currentCounts };

        switch (notificationType) {
            case 'announcement':
                if (updatedCounts.announcementCount) {
                    updatedCounts.announcementCount -= value;
                }
                break;
            case 'assignedJob':
                if (updatedCounts.assignedJobCount) {
                    updatedCounts.assignedJobCount -= value;
                }
                break;
            case 'dealSheet':
                if (updatedCounts.dealSheetCount) {
                    updatedCounts.dealSheetCount -= value;
                }
                break;
            case 'feedbackRequest':
                if (updatedCounts.feedbackCount) {
                    updatedCounts.feedbackCount -= value;
                }
                break;
            case 'quotation':
                if (updatedCounts.quotationCount) {
                    updatedCounts.quotationCount -= value;
                }
                break;
            case 'enquiry':
                if (updatedCounts.enquiryCount) {
                    updatedCounts.enquiryCount -= value;
                }
                break;
        }

        this.notificationsSubject.next(updatedCounts);
    }

    getEmployeeNotifications(token: string) {
        this.http.get<NotificationCounts>(`${this.api}/employee/notifications/${token}`).subscribe((data) => {
            this.notificationsSubject.next(data);
        })
    }

    authSocketIo(token: string) {
        this.socket.emit('auth', token);
    }
}


