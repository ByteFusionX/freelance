import { Component, Input } from '@angular/core';
import { sideBarState } from './side-bar.animation';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
  animations : [sideBarState]
})
export class SideBarComponent {

  @Input() showFullBar: boolean = true
  showToggle: boolean = false
  
}
