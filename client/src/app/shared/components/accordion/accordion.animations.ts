import { animate, state, style, transition, trigger } from "@angular/animations";

export const AccordionAnimationState = trigger('sideBarTrigger', [
    state('default', style({
        // width: '14rem',
        // opacity: 1
    })),
    state('reduce', style({
        // width: '2rem',
    })),
    transition('default => reduce', animate('300ms')),
    transition('reduce => default', animate('300ms'))
])