import { Component, OnInit } from '@angular/core';
import { GlobalEventsManager } from '../global-events-manager/global-events-manager.component';

@Component({
  selector: 'app-background',
  template: `
  <div class="background">
  <div *ngIf="showNavBar">
      <app-router></app-router>
      </div>
      <router-outlet></router-outlet>
      
  </div>
  `,
  styleUrls: ['./background.component.css']
})
export class BackgroundComponent implements OnInit {

  showNavBar: boolean = false;

  constructor(private globalEventsManager: GlobalEventsManager) {
  this.globalEventsManager.showNavBarEmitter.subscribe(mode => {
    if(mode !== null){
      this.showNavBar = mode;
    }
  }) }

  ngOnInit() {
  }

}
