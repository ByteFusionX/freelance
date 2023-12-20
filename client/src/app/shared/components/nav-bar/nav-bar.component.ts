import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  standalone: true,
  imports: [CommonModule, IconsModule, MatMenuModule, MatButtonModule ]
})
export class NavBarComponent {

  @Output() reduce = new EventEmitter<boolean>()
  showFullBar: boolean = true

  reduceSideBar() {
    this.showFullBar = !this.showFullBar
    this.reduce.emit(this.showFullBar)
  }
}
