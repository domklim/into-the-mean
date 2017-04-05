import { Component, OnInit } from '@angular/core';
import { GlobalEventsManager } from 
'../global-events-manager/global-events-manager.component';

@Component({
  selector: 'app-about-component',
  template: `
  <div>
      <img [src]="qr" class="qrCode">
  </div>
  
  `,
  styleUrls: ['./about-component.component.css']
})

export class AboutComponent implements OnInit {

	private qr = require('./qrAlpha.png');

  constructor(private globalEvent: GlobalEventsManager) {
  this.globalEvent.showNavBar(true);
   }

  ngOnInit() {
  }

}
