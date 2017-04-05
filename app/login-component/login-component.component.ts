import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestOptions, Http, Headers, URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';
import { GlobalEventsManager } from '../global-events-manager/global-events-manager.component';

@Component({
	selector: 'app-login-component',
	template: `
     
    <div class="centered">
        <img [src]="domotiQue">
    </div>


<div class="login">
	<form [formGroup]="form"
	    (submit)="onSubmit(form.value.username,
	    form.value.password)">
	    <div class="usernames">
	    <label for="username"
	        class="logLabelCreds">Username</label>
	    <input type="text"
	        class="logInput"
	        placeholder="Username"
	        [formControl]="form.controls.username"
	        ngModel >
	    </div>
	    <div class="password">
	        <label for="password"
	            class="logLabelCreds">Password</label>
	        <input type="password"
	            class="logInput"
	            placeholder="password"
	            [formControl]="form.controls.password">
	    </div>
	    <div class ="required">
	        <span> &nbsp; </span>
	    <span *ngIf="form.controls.password.hasError('required')
	            && form.controls.password.touched
	            && form.controls.username.valid
	            && !message">
	        <img [src]="exclamationMark"
	            class="imgExclamation">
	            Enter password
	    </span>
	    <span *ngIf="form.controls.username.hasError('required')
	        && form.controls.password.valid 
	        && form.controls.username.touched
	        && !message">
	        <img [src]="exclamationMark"
	            class="imgExclamation">
	            Enter username
	    </span>
	    <span *ngIf="message">
	        <img [src]="exclamationMark"
	        class="imgExclamation">
	           Wrong password
	        </span>
	    </div>
	    <div class="submit">
	    	<button type="submit"
	    	    class="btnEnter"> 
	    	        <span>
	    	            Submit
	    	        </span>
	        </button>
	    </div>
	</form>
	</div>
	`,
	styleUrls: ['./login-component.component.css']
})

export class LoginComponent {
	domotiQue = 'assets/img/domotiQue_v03.png';
	exclamationMark = 'assets/img/excl2.png';
	form: FormGroup;
	private message: boolean;
	public token: string = '';

	constructor(fb: FormBuilder,
	 private http: Http,
	 private router: Router,
	 private globalEventsManager: GlobalEventsManager){
		this.form = fb.group({
			'username': ['', Validators.required],
			'password': ['', Validators.required]
		});
		this.globalEventsManager.showNavBar(false);
	}

	onSubmit(username: any, password: any): void {

		let headers = new Headers();
		headers.append('content-type', 'application/json');

		let data = new URLSearchParams();
		data.append('username', btoa(username));
		data.append('password', btoa(password));
		console.log(data['username']);

		this.http.post('/api/auth',
			data,
			headers
			).subscribe(res => {
				console.log(res.json());
				
				if(res.json().token){
					let username = res.json().username.toString();
					let token = res.json().token;
					localStorage.setItem('token', token);
					this.token = token;
					localStorage.setItem('username', username);
					this.router.navigate(['/home']);
				} 			
			},
			(err) => {
				if(err.status == 404){ 
					this.message = true
					setTimeout(() => {
						this.message = false
					}, 2500);
					console.log("Invalid");
				}
			})
	}
}

