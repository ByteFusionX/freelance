import { NgModule } from '@angular/core';
import { CelebrationDialogComponent } from './celebration-dialog/celebration-dialog.component';
import { ConfettiComponentComponent } from './confetti-component/confetti-component.component';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { CommonModule } from '@angular/common';


@NgModule({
    imports: [ConfettiComponentComponent,IconsModule,CommonModule,],
    exports: [],
    declarations: [CelebrationDialogComponent],
    providers: [],
})
export class componentModule { }
