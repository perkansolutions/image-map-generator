import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { DraggableDirectiveEvent } from '../draggable.directive';

@Component({
  selector: 'g[hotspot]',
  templateUrl: './hotspot.component.html',
  styleUrls: ['./hotspot.component.css'],
})
export class HotspotComponent {
  @Input()
  coords: { x: number; y: number }[] = [];

  @HostBinding('class.hidden')
  @Input()
  hidden = false;

  @HostBinding('class.selected')
  @Input()
  selected = false;

  @Output()
  coordsChange = new EventEmitter<{ x: number; y: number }[]>();

  @Input()
  previewPoint?: { x: number; y: number };

  previewCoords = () =>
    this.previewPoint ? [this.previewPoint, ...this.coords] : this.coords;

  resizeObserver?: ResizeObserver;

  @Input()
  svgSize?: { width: number; height: number };

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  handlePointDrag(
    event: DraggableDirectiveEvent,
    point: { x: number; y: number },
  ) {
    if (this.svgSize == null) {
      throw new Error('svgSize is null');
    }

    point.x += event.deltaX / this.svgSize?.width;
    point.y += event.deltaY / this.svgSize?.height;
  }

  handlePointDragComplete(point: { x: number; y: number }) {
    this.coordsChange.emit(this.coords);
  }
}
