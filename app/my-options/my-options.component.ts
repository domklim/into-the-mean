import { Injectable } from '@angular/core';
import { Http, XHRBackend, RequestOptions, Request, RequestOptionsArgs, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()

export class HttpService extends Http {

  constructor(backend: XHRBackend,
  	 options: RequestOptions) { 
  	
  	let token = localStorage.getItem('token');
  	options.headers.set('x-access-token', token);
  	super(backend, options);
  }

  request(url: string|Request, options?:RequestOptionsArgs): Observable<Response> {
  	let token = localStorage.getItem('token');
  	if (typeof url === 'string') {
  		if (!options) {
  			options = {headers: new Headers()};
  		}
  		options.headers.set('x-access-token', token);
  	} else {
  		url.headers.set('x-access-token', token);
  	}
  	return super.request(url, options).catch(this.catchAuthError(this));
  }

  private catchAuthError (self: HttpService) {
  	return (res: Response) => {
  		console.log(res);
  		if( res.status === 401 || res.status === 403){
  			console.log('not authenticated');
  		}
  		return Observable.throw(res);
  	};
  }

}

export function httpFactory(backend: XHRBackend, options: RequestOptions) {
  return new HttpService(backend, options);
}

