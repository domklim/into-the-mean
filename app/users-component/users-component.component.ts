import { Component, OnInit } from '@angular/core';
import { GlobalEventsManager } from 
'../global-events-manager/global-events-manager.component';
import { HttpService,  } from '../my-options/my-options.component';
import { RequestOptionsArgs, RequestMethod, RequestOptions } from '@angular/http';

@Component({
  selector: 'app-users-component',
  template: `
  <div class="notYet">
    <div class="container">
      <div *ngFor="let user of userList; let i = index"> 
            <div class="item">
                <div class="second">
                   <span class="textStyle"> {{user}} </span>
                   <img [src]="deleteMark"
                   class="delSign"
                   (click)="delUser(user)">
                <div>
            </div>
      </div>
    <div>
  </div>`,
  styleUrls: ['./users-component.component.css']
})
export class UsersComponent implements OnInit {

	private userList: Array<string> = [];
	private deleteMark = 'assets/img/x2.png';

  constructor(private globalEvent: GlobalEventsManager,
  	          private http: HttpService) {
  this.globalEvent.showNavBar(true);
   }

  ngOnInit() {
  	this.http.get('/api/users')
  	.subscribe(res => {
    	for(let i=0; i < res.json().length; i++){
  			this.userList.push(res.json()[i]);
  		}

    });
  }


    delUser(id: any):void {
    	let body = {
    		username: id
    	};
    	let options = new RequestOptions({
    		body: body,
    		method: RequestMethod.Delete
    	});

    	console.log(this.userList.indexOf(id));
    	this.http.delete('/api/users',options)
    	.subscribe(res => {
    		console.log(res);
    	},
    	err => {
    		console.log(err);
    	},
    	() => {
    		this.userList.splice(this.userList.indexOf(id), 1)
    	});
     }

}
