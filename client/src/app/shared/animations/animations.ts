import { animate, animation, style } from "@angular/animations";

export const opacityIn = animation([
    style({
        opacity: 0
      }),
      animate('200ms',
        style({
          opacity: 1
        })
      )
])

export const opacityOut = animation([
    animate('200ms',
        style({
          opacity: 0
        })
      )
])

export const moveDown = animation([
  style({
      transform: 'translateY(-100%)'
  }),
  animate('300ms',
      style({
          transform: 'translateY(0)'
      })
  )
])

export const moveUp = animation([
  animate('300ms',
      style({
          transform: 'translateY(0%)'
      })
  )
])