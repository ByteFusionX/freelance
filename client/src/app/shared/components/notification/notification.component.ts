import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { IconsModule } from 'src/app/lib/icons/icons.module';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  standalone: true,
  imports: [CommonModule, IconsModule]
})
export class NotificationComponent {
  @Output() closeSidenav = new EventEmitter<void>();

  onClose() {
    this.closeSidenav.emit();
  }
}
