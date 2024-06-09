import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[translate]',
})
export class TranslateDirective {
  @Input()
  translate?: { x: number; y: number };

  @HostBinding('style.transform')
  get transform() {
    return this.translate
      ? `translate(${this.translate.x}px, ${this.translate.y}px)`
      : '';
  }
}
