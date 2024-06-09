import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'points',
  pure: false,
})
export class PointsPipe implements PipeTransform {
  transform(value: { x: number; y: number }[]): string {
    return value.map(({ x, y }) => `${x},${y}`).join(' ');
  }
}
