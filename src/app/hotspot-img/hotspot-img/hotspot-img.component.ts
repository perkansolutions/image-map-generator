import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
  afterNextRender,
} from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { DraggableDirectiveEvent } from '../draggable.directive';
import { ImgHotspot } from '../img-hotspot';

@Component({
  selector: 'app-hotspot-img',
  templateUrl: './hotspot-img.component.html',
  styleUrls: ['./hotspot-img.component.css'],
})
export class HotspotImgComponent implements OnDestroy {
  @Input()
  hotspots: ImgHotspot[] = [];

  @Input()
  editable = false;

  @Output()
  hotspotsChange = new EventEmitter<ImgHotspot[]>();

  @Output()
  hotspotClick = new EventEmitter<ImgHotspot>();

  @Output()
  missedClick = new EventEmitter<{ count: number }>();

  @Input()
  selectedHotspot?: ImgHotspot;

  @Output()
  selectedHotspotChange = new EventEmitter<ImgHotspot | undefined>();

  private missedClickCount = 0;

  newHotspotCoords?: { x: number; y: number }[];
  translations = new Map<ImgHotspot, { x: number; y: number }>();
  newHotspotPreviewPoint?: { x: number; y: number };

  @ViewChild('svg')
  private svg?: ElementRef<SVGElement>;
  svgSize?: { width: number; height: number };

  private isSingleClick = true;
  private subscriptions = new Subscription();
  private pointerMoveSubscription?: Subscription;

  constructor(private zone: NgZone) {
    this.handleSvgEvents();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.pointerMoveSubscription?.unsubscribe();
  }

  @HostListener('document:keydown.enter')
  public completeNewHotspot() {
    if (this.newHotspotCoords == null) {
      return;
    }

    const newHotspot: ImgHotspot = {
      coords: this.newHotspotCoords,
    };

    this.hotspots.push(newHotspot);
    this.hotspotsChange.emit(this.hotspots);

    this.newHotspotCoords = undefined;
    this.pointerMoveSubscription?.unsubscribe();
  }

  @HostListener('document:keydown.escape')
  public cancelNewHotspot() {
    this.newHotspotCoords = undefined;
    this.pointerMoveSubscription?.unsubscribe();
  }

  @HostListener('document:keydown.delete')
  public deleteSelectedHotspot() {
    if (this.selectedHotspot == null || !this.editable) {
      return;
    }

    const index = this.hotspots.indexOf(this.selectedHotspot);
    if (index >= 0) {
      this.hotspots.splice(index, 1);
      this.hotspotsChange.emit(this.hotspots);
    }

    this.selectedHotspot = undefined;
    this.selectedHotspotChange.emit(undefined);
  }

  handleHotspotClick(event: Event, hotspot: ImgHotspot) {
    event.stopImmediatePropagation();
    this.hotspotClick.emit(hotspot);
    this.selectedHotspot = hotspot;
    this.selectedHotspotChange.emit(hotspot);
  }

  handleHotspotDrag(event: DraggableDirectiveEvent, hotspot: ImgHotspot) {
    if (this.svgSize == null) {
      throw new Error('svgSize is null');
    }

    this.translations.set(hotspot, {
      x: event.totalX / this.svgSize.width,
      y: event.totalY / this.svgSize.height,
    });
  }

  handleHotspotDragComplete(hotspot: ImgHotspot) {
    const translation = this.translations.get(hotspot);
    if (translation == null) {
      return;
    }

    for (const coord of hotspot.coords) {
      coord.x += translation.x;
      coord.y += translation.y;
    }

    this.translations.delete(hotspot);
    this.hotspotsChange.emit(this.hotspots);
  }

  handleHotspotCoordsChange(
    coords: { x: number; y: number }[],
    hotspot: ImgHotspot,
  ) {
    hotspot.coords = coords;
    this.hotspotsChange.emit(this.hotspots);
  }

  handleResize($event: ResizeObserverEntry[]) {
    this.svgSize = {
      width: $event[0].contentRect.width,
      height: $event[0].contentRect.height,
    };
  }

  private beginNewHotspot(coords: { x: number; y: number }) {
    this.newHotspotCoords = [coords];
    this.newHotspotPreviewPoint = { ...coords };
    if (
      this.pointerMoveSubscription == null ||
      this.pointerMoveSubscription.closed
    ) {
      this.pointerMoveSubscription = fromEvent(
        this.svg!.nativeElement,
        'pointermove',
      ).subscribe((event) => {
        this.previewNewHotspotPoint(event as PointerEvent);
      });
    }
  }

  private handleSvgClick(event: MouseEvent) {
    event.stopImmediatePropagation();
    event.preventDefault();
    this.isSingleClick = true;
    setTimeout(() => {
      if (this.isSingleClick) {
        this.handleSingleClick(event);
      }
    }, 50);
  }

  private handleSvgDblClick(event: MouseEvent) {
    this.isSingleClick = false;
    this.completeNewHotspot();
  }

  private appendPointToNewHotspot(coords: { x: number; y: number }) {
    if (this.newHotspotCoords == null) {
      return;
    }
    this.newHotspotCoords = [...this.newHotspotCoords, coords];
  }

  private previewNewHotspotPoint(event: MouseEvent) {
    if (this.newHotspotCoords == null) {
      return;
    }

    if (this.svg?.nativeElement == null) {
      throw new Error('svg element not found');
    }

    const width = this.svg.nativeElement.clientWidth;
    const height = this.svg.nativeElement.clientHeight;

    const coords = {
      x: event.offsetX / width,
      y: event.offsetY / height,
    };

    if (this.newHotspotPreviewPoint == null) {
      this.newHotspotPreviewPoint = coords;
    } else {
      this.newHotspotPreviewPoint.x = coords.x;
      this.newHotspotPreviewPoint.y = coords.y;
    }
  }

  private handleSingleClick(event: MouseEvent) {
    if (!this.editable) {
      this.missedClick.emit({ count: ++this.missedClickCount });
      return;
    }

    const naturalWidth = this.svg?.nativeElement.clientWidth;
    const naturalHeight = this.svg?.nativeElement.clientHeight;
    if (naturalWidth == null || naturalHeight == null) {
      return;
    }
    // fallback to layerX and layerY for Firefox
    const x =
      event.offsetX === 0 &&
      event.offsetY === 0 &&
      'layerX' in event &&
      Number(event.layerX) > 0
        ? Number(event.layerX)
        : event.offsetX;
    const y =
      event.offsetY === 0 &&
      event.offsetX === 0 &&
      'layerY' in event &&
      Number(event.layerY) > 0
        ? Number(event.layerY)
        : event.offsetY;
    const coords = {
      x: x / naturalWidth,
      y: y / naturalHeight,
    };
    if (this.newHotspotCoords == null) {
      this.beginNewHotspot(coords);
    } else {
      this.appendPointToNewHotspot(coords);
    }
  }

  private handleSvgEvents() {
    afterNextRender(() => {
      this.zone.run(() => {
        if (this.svg?.nativeElement == null) {
          throw new Error('svg element not found');
        }
        this.subscriptions.add(
          fromEvent(this.svg.nativeElement, 'click').subscribe((event) => {
            this.handleSvgClick(event as PointerEvent);
          }),
        );
        this.subscriptions.add(
          fromEvent(this.svg.nativeElement, 'dblclick').subscribe((event) => {
            this.handleSvgDblClick(event as PointerEvent);
          }),
        );
      });
    });
  }
}
