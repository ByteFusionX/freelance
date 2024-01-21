import { transition, trigger } from '@angular/animations';
import { opacityIn, opacityOut } from './animations';

export const opacityState = trigger('opacityTrigger', [
    transition(':enter', [opacityIn]),
    transition(":leave",[opacityOut])
  ])