import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class AuthService {
  authToken: any;
  user: any;
  isDev:boolean;
  protocol: String = 'http://';
  host: any = window.location.hostname;
  port: any = ':3000';
   constructor(private http: Http) {
     this.isDev = true; // Change to false before deployment
   }
// User
  registerUser(user){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(this.protocol + this.host + this.port + '/users/register', user,{headers: headers})
    .map(res => res.json());
  }

  authenticateUser(user){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(this.protocol + this.host + this.port + '/users/authenticate', user,{headers: headers})
    .map(res => res.json());
  }

  getProfile(){
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken)
    headers.append('Content-Type', 'application/json');
    return this.http.get(this.protocol + this.host + this.port + '/users/profile', {headers: headers})
    .map(res => res.json());
  }
  storeUserData(token, user){
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loadToken(){
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  loggedIn() {
    return tokenNotExpired('id_token');
  }

  logout(){
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }
  prepEndpoint(ep){
   if(this.isDev){
     return ep;
   } else {
     return 'http://localhost:8080/'+ep;
   }
 }

//Moodle
updateMoodle(id, moodle){
  let headers = new Headers();
  let options = new RequestOptions({ headers: headers });
  headers.append('Content-Type', 'application/json');
  let body = JSON.stringify(moodle);
  console.log(body)
  return this.http.put("http://localhost:3000/users/update/" + id, body, options)
  .map(res => res.json());
}
}
