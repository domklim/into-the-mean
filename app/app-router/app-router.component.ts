import { Component, OnInit } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { AboutComponent } from '../about-component/about-component.component';
import { DevicesComponent } from '../devices-component/devices-component.component';
import { UsersComponent } from '../users-component/users-component.component';
import { HomeComponent } from '../home-component/home.component';
import { routes } from './routes';
import { LoginComponent } from '../login-component/login-component.component';
import { GlobalEventsManager } from '../global-events-manager/global-events-manager.component';

@Component({
  selector: 'app-router',
  template: `
      <div class="routerDiv">
          <ul class="navBar">
              <li routerLinkActive="activeRoute"
                   [routerLinkActiveOptions]="{exact: true}">
                   <a [routerLink]="['./home']">Home</a></li>
              <li routerLinkActive="activeRoute">
                  <a [routerLink]="['./devices']">Devices</a></li>
              <li routerLinkActive="activeRoute">
                  <a [routerLink]="['./users']">Users</a></li>
                  <li routerLinkActive="activeRoute">
                  <a [routerLink]="['./about']">About</a></li>
              <li class="logOut"><a (click)="logOut()">Logout</a></li>
          </ul>
      </div>
      <div class="username">
          Logged in as: {{ loggedAs }}
      </div>
  `,
  styleUrls: ['./app-router.component.css']
})

export class AppRouter implements OnInit {
    
    showNavBar: boolean = false;
    loggedAs: string;

  constructor(private router: Router) { 
      
    }
  
  logOut(): void {
  	localStorage.clear();
    console.log("logout")
    this.router.navigate(['login']);
  }

  ngOnInit() {
    this.loggedAs = localStorage.getItem('username');
  }

}
