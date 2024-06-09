import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotspotImgComponent } from './hotspot-img/hotspot-img.component';
import { HotspotComponent } from './hotspot/hotspot.component';
import { DraggableDirective } from './draggable.directive';
import { PointsPipe } from './points.pipe';
import { TranslateDirective } from './translate.directive';
import { ResizeObserverModule } from '@ng-web-apis/resize-observer';

@NgModule({
  declarations: [
    HotspotImgComponent,
    HotspotComponent,
    DraggableDirective,
    PointsPipe,
    TranslateDirective,
  ],
  imports: [CommonModule, ResizeObserverModule],
  exports: [HotspotImgComponent],
})
export class HotspotImgModule {}
