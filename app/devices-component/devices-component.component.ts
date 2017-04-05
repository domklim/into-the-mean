import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { GlobalEventsManager } from 
'../global-events-manager/global-events-manager.component';
import { HttpService } from '../my-options/my-options.component';

@Component({
  selector: 'app-devices-component',
  template: `
  <div class="container">
      <div class="relay">
          <span id="relaySpan"> Relay 1 </span>
          <label class="switch">
            <input type="checkbox"
            name="isActive"
            [(ngModel)]="isSelected"
            (change)="toMqtt($event, 'relay1')">
            <div class="slider round"></div>
          </label>   
      </div>
      <div class="relay">
          <span id="relaySpan"> Relay 2 </span>
          <label class="switch">
            <input type="checkbox"
            name="isActive2"
            [(ngModel)]="isSelected2"
            (change)="toMqtt($event, 'relay2')">
            <div class="slider round"></div>
          </label>   
      </div>
      <div class="relay">
          <span id="relaySpan"> Relay 3 </span>
          <label class="switch">
            <input type="checkbox"
            name="isActive3"
            [(ngModel)]="isSelected3"
            (change)="toMqtt($event, 'relay3')">
            <div class="slider round"></div>
          </label>   
      </div>
  </div>
  `,
  styleUrls: ['./devices-component.component.css']
})
export class DevicesComponent implements OnInit {
	private isSelected: boolean;
  private isSelected2: boolean;
  private isSelected3: boolean;

	 data: Object = {
		deviceId: '',
		status: ''

	}

  constructor(private http: HttpService,
    private globalEvent: GlobalEventsManager) {
    this.globalEvent.showNavBar(true);
   }

   toMqtt(e, device: string){
   	console.log(e.target.checked);
   	if(e.target.checked){
   		this.data['deviceId'] = device;
  		this.data['status'] = 'on';
    } else {
    	this.data['deviceId'] = device;
    	this.data['status'] = 'off'
    }

  	    this.http.post('/api/devices', this.data)
  	    .subscribe(res => { },
  	    	err => {console.log(err);})
   	} 
   


  ngOnInit() {
  	this.http.get('/api/devices/?id=relay1')
  	.subscribe(res => { 
  		if(res.json().status == 'on'){
  			this.isSelected = true;
  		}
  	})
    this.http.get('/api/devices/?id=relay2')
    .subscribe(res => { 
      if(res.json().status == 'on'){
        this.isSelected2 = true;
      }
    })
    this.http.get('/api/devices/?id=relay3')
    .subscribe(res => { 
      if(res.json().status == 'on'){
        this.isSelected3 = true;
      }
    })
  }

}
