import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HotspotImgModule } from './hotspot-img/hotspot-img.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HotspotImgModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
