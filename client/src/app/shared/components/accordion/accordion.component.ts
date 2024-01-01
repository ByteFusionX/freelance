import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NbAccordionModule } from '@nebular/theme'
import { NgIconComponent, NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  heroBars3,
  heroMagnifyingGlass,
  heroUserCircle,
  heroChevronDown,
  heroHome,
  heroChevronUp
} from '@ng-icons/heroicons/outline';
import { AccordionAnimationState } from './accordion.animations';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.css'],
  animations: [AccordionAnimationState],
  standalone: true,
  imports: [NbAccordionModule, NgIconComponent, CommonModule, NgIconsModule],
})
export class AccordionComponent {

  showToggle:boolean = false;
  @Input() showFullBar: boolean = true
  @Input() title!:string;
  @Input() icon!:string;
  @Input() lists:string[] = []

}
