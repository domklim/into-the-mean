import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule,  } from '@angular/forms';
import { HttpModule, XHRBackend, RequestOptions } from '@angular/http';
import { RouterModule } from '@angular/router';
import { HttpService, httpFactory } from '../app/my-options/my-options.component';

import { AppComponent } from  './app.component';
import { AppRouter } from './app-router/app-router.component';
import { AboutComponent } from './about-component/about-component.component';
import { DevicesComponent } from './devices-component/devices-component.component';
import { UsersComponent } from './users-component/users-component.component';
import { HomeComponent } from './home-component/home.component';
import { LoginComponent } from './login-component/login-component.component';
import { BackgroundComponent } from './background-component/background.component';

import { APP_BASE_HREF, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { routes } from './app-router/routes';
import { LoggedInGuard } from './app-login/loggedIn';
import { GlobalEventsManager } from './global-events-manager/global-events-manager.component';

@NgModule({
  declarations: [
    AppComponent,
    AppRouter,
    AboutComponent,
    DevicesComponent,
    UsersComponent,
    HomeComponent,
    LoginComponent,
    BackgroundComponent

  ],
  imports: [
    RouterModule.forRoot(routes, `enableTracing`),
    BrowserModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule
  ],
  providers: [
  { provide: LocationStrategy, useClass: PathLocationStrategy},
  { provide: APP_BASE_HREF, useValue: '/'},
  { provide: GlobalEventsManager, useClass: GlobalEventsManager},
  { provide: LoggedInGuard, useClass: LoggedInGuard},
  { provide: HttpService, useFactory: httpFactory,
  deps: [XHRBackend, RequestOptions]}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule)
.catch(err => console.log(err));