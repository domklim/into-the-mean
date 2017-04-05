import { Routes } from '@angular/router';
import { AboutComponent } from '../about-component/about-component.component';
import { DevicesComponent } from '../devices-component/devices-component.component';
import { UsersComponent } from '../users-component/users-component.component';
import { HomeComponent } from '../home-component/home.component';
import { LoginComponent } from '../login-component/login-component.component';
import { LoggedInGuard } from '../app-login/loggedIn';


export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full'},
    { path: 'login', component: LoginComponent},
    { path: 'home', component: HomeComponent,
    canActivate: [LoggedInGuard]},
    { path: 'about', component: AboutComponent,
    canActivate: [LoggedInGuard]},
    { path: 'devices', component: DevicesComponent,
    canActivate: [LoggedInGuard]},
    { path: 'users', component: UsersComponent,
    canActivate: [LoggedInGuard]},
    { path: '**', redirectTo: '/login'}
]