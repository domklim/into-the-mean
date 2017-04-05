import { Component, OnInit, Input } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { GlobalEventsManager } from '../global-events-manager/global-events-manager.component';
import { LoginComponent } from '../login-component/login-component.component';
import { HttpService } from '../my-options/my-options.component';

@Component({
  selector: 'app-home',
  template: `
  <div class="container">
      <img [src]="homeDraft" class="bedroom">
      <div [ngSwitch]="isLampOn">
          <div *ngSwitchCase="true">
              <img [src]="lampOn" 
              class="lampOne"
              (click)="toMqtt('relay2', 'off')">
          </div>
          <div *ngSwitchCase="false">
             <img [src]="lampOff" 
             class="lampOne"
             (click)="toMqtt('relay2', 'on')">
          </div>

      <div [ngSwitch]="flowersIsSelected">
          <div *ngSwitchCase="true" class="fade">
              <img [src]="flowersOff" 
              class="flowers"
              (click)="toMqtt('relay1', 'off')">

              <img [src]="flowersOn" 
              class="flowersBlink"
              (click)="toMqtt('relay1','off')">
          </div>
          <div *ngSwitchCase="false">
              <img [src]="flowersOff" class="flowers"
              (click)="toMqtt('relay1', 'on')">
          </div>
      </div>
  </div>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	private homeDraft = require('../../../../art/bedroom3.png');
	private lampOn = require('../../../../art/lampOn.png');
  private lampOff = require('../../../../art/lampOff.png');
	private flowersOff = require('../../../../art/flowersOff.png');
	private flowersOn = require('../../../../art/flowersOn.png');
	private flowersOnMixed = require('../../../../art/flowersOnMixed2.png');
	private flowersIsSelected: boolean = false;
  private isLampOn: boolean = false;
	private data: Object = {
		deviceId: '',
		status: ''
	};
  private token: string;
	
  constructor(private http: HttpService,
  	private globalEvents: GlobalEventsManager) { 
  	this.globalEvents.showNavBar(true);
  }

  ngOnInit() {

  	 this.http.get('/api/devices/?id=relay1')
  	.subscribe(res => {
  		console.log(res.json().status);
  		if(res.json().status == 'on'){
  			console.log(res.json().status);
  			this.flowersIsSelected = true;
  		}
    });

      this.http.get('/api/devices/?id=relay2')
      .subscribe( res => {
        console.log(res.json());
        if(res.json().status == 'on'){
          this.isLampOn = true;
        };      
  	});

    this.token = localStorage.getItem('token');
  }

  toMqtt(device: string,
    state: string) {
    this.data['deviceId'] = device;
    this.data['status'] = state;
  	this.http.post('/api/devices',
  		this.data)
  	.subscribe(res => {console.log(res);},
  		err => {});
  	if(state == 'off' && device == 'relay1'){
  		this.flowersIsSelected = false;
  	} else if (state == 'on' && device == 'relay1'){
  		this.flowersIsSelected = true;
  	} else if (state == 'off' && device == 'relay2'){
      this.isLampOn = false;
    } else if (state == 'on' && device == 'relay2') {
      this.isLampOn = true;
    }
  }
 }
