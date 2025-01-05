import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EventsService } from 'src/app/core/services/events/events.service';
import { Observable, Subscription } from 'rxjs';
import { EventsComponent } from '../events/events.component';
import { ToastrService } from 'ngx-toastr';
import { Events } from '../../interfaces/evets.interface';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, IconsModule, MatDialogModule, EventsComponent],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css'],
  providers: [DatePipe]
})
export class EventsListComponent implements OnInit, OnDestroy {

  private subscriptions = new Subscription()
  events$!: Observable<Events[]>;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EventsListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { collectionId: string, from: string },
    private _eventsServices: EventsService,
    private toaster: ToastrService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    if (this.data.collectionId) {
      this.fetchEvents()
      // this.subscriptions.add(
      //   this._eventsServices.fetchEvents(this.data.collectionId).subscribe((res) => {
      //     console.log(res);
      //   })
      // )
    }
  }
  
  fetchEvents(){
    this.events$ = this._eventsServices.fetchEvents(this.data.collectionId)
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  onClose() {
    this.dialogRef.close()
  }

  onNewEventClicks() {
    const dialog = this.dialog.open(EventsComponent, { data: this.data })
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.fetchEvents()
        this.toaster.success(res.message || 'Event created successfully');
      }
    })
  }

  formatDate(date: Date): string {
    const dateStr = this.datePipe.transform(date, 'd MMMM yyyy, h:mm a');
    return this.addOrdinalSuffix(dateStr!);
  }

  addOrdinalSuffix(dateStr: string): string {
    const day = parseInt(dateStr.split(' ')[0], 10);
    const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor(day / 10) === 1) ? 0 : day % 10];
    return dateStr.replace(day.toString(), `${day}${suffix}`);
  }
}
