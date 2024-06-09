import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';

export type DraggableDirectiveEvent = {
  totalX: number;
  totalY: number;
  deltaX: number;
  deltaY: number;
};

@Directive({
  selector: '[draggable]',
})
export class DraggableDirective {
  private dragConditions?: {
    startX: number;
    startY: number;
    prevX: number;
    prevY: number;
  };

  @Output()
  drag = new EventEmitter<DraggableDirectiveEvent>();

  @Output()
  dragComplete = new EventEmitter<void>();

  private pointerMoveSubscription?: Subscription;
  private pointerUpSubscription?: Subscription;
  private touchMoveSubscription?: Subscription;
  private touchEndSubscription?: Subscription;

  constructor() {}

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent) {
    event.stopImmediatePropagation();
    event.preventDefault();
    this.dragConditions = {
      startX: event.clientX,
      startY: event.clientY,
      prevX: event.clientX,
      prevY: event.clientY,
    };
    this.pointerMoveSubscription = fromEvent(document, 'pointermove').subscribe(
      (e) => this.onPointerMove(e as PointerEvent),
    );
    this.pointerUpSubscription = fromEvent(document, 'pointerup').subscribe(
      (e) => this.onPointerUp(e as PointerEvent),
    );
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    event.stopImmediatePropagation();
    event.preventDefault();
    this.dragConditions = {
      startX: event.touches[0].clientX,
      startY: event.touches[0].clientY,
      prevX: event.touches[0].clientX,
      prevY: event.touches[0].clientY,
    };
    this.touchMoveSubscription = fromEvent(document, 'touchmove').subscribe(
      (e) => this.onTouchMove(e as TouchEvent),
    );
    this.touchEndSubscription = fromEvent(document, 'touchend').subscribe((e) =>
      this.onTouchUp(e as TouchEvent),
    );
  }

  onPointerMove(event: PointerEvent) {
    if (!this.dragConditions) {
      return;
    }
    event.stopImmediatePropagation();
    event.preventDefault();

    this.drag.emit({
      totalX: event.clientX - this.dragConditions.startX,
      totalY: event.clientY - this.dragConditions.startY,
      deltaX: event.clientX - this.dragConditions.prevX,
      deltaY: event.clientY - this.dragConditions.prevY,
    });

    this.dragConditions.prevX = event.clientX;
    this.dragConditions.prevY = event.clientY;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.dragConditions) {
      return;
    }
    event.stopImmediatePropagation();
    event.preventDefault();

    this.drag.emit({
      totalX: event.touches[0].clientX - this.dragConditions.startX,
      totalY: event.touches[0].clientY - this.dragConditions.startY,
      deltaX: event.touches[0].clientX - this.dragConditions.prevX,
      deltaY: event.touches[0].clientY - this.dragConditions.prevY,
    });

    this.dragConditions.prevX = event.touches[0].clientX;
    this.dragConditions.prevY = event.touches[0].clientY;
  }

  onPointerUp(event: PointerEvent) {
    if (this.dragConditions) {
      this.dragConditions = undefined;
      this.dragComplete.emit();
      event.stopImmediatePropagation();
    }
    this.pointerMoveSubscription?.unsubscribe();
    this.pointerUpSubscription?.unsubscribe();
  }

  onTouchUp(event: TouchEvent) {
    if (this.dragConditions) {
      this.dragConditions = undefined;
      this.dragComplete.emit();
      event.stopImmediatePropagation();
    }
    this.touchMoveSubscription?.unsubscribe();
    this.touchEndSubscription?.unsubscribe();
  }
}
