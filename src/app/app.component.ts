import { Component } from '@angular/core';
import { ImgHotspot } from './hotspot-img/img-hotspot';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  hotspots: ImgHotspot<string>[] = [];
  selectedHotspot?: ImgHotspot<string>;

  clickEvents: string[] = [];

  constructor() {
    // load hotspots from local storage for demo purposes
    const hotspots = localStorage.getItem('hotspots');
    if (hotspots) {
      this.hotspots = JSON.parse(hotspots);
    }
  }

  handleHotspotsChange($event: ImgHotspot[]) {
    // save hotspots to local storage for demo purposes
    this.hotspots = $event;
    localStorage.setItem('hotspots', JSON.stringify($event));
  }

  deleteHotspot(hotspot: ImgHotspot) {
    this.hotspots = this.hotspots.filter((h) => h !== hotspot);
  }
}
