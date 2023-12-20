import { animate, animation, state, style, transition, trigger, useAnimation } from "@angular/animations"


const moveDown = animation([
    style({
        transform: 'translateY(-100%)'
    }),
    animate('300ms',
        style({
            transform: 'translateY(0)'
        })
    )
])
const moveUp = animation([
    animate('300ms',
        style({
            transform: 'translateY(0%)'
        })
    )
])

export const sideBarState = trigger('sideBarTrigger', [
    state('default', style({
        width: '15rem',
        opacity: 1
    })),
    state('reduce', style({
        width: '2.1rem',
    })),
    transition('default => reduce', animate('300ms')),
    transition('reduce => default', animate('300ms')),
])

export const dropDownMenuSate = trigger('dropDownTrigger', [
    transition(':enter', useAnimation(moveDown)),
    transition(':leave', useAnimation(moveUp)),
])

export const buttonSlideState = trigger('slideTrigger',[
    transition('slideUp => slideDown',useAnimation(moveDown)),
    transition('slideDown => slideUp',useAnimation(moveUp)),
])
