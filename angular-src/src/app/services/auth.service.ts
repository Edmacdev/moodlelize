import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class AuthService {
  authToken: any;
  user: any;
  isDev:boolean;
   constructor(private http: Http) {
     this.isDev = true; // Change to false before deployment
   }

  registerUser(user){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("http://localhost:3000/users/register", user,{headers: headers})
    .map(res => res.json());
  }

  authenticateUser(user){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("http://localhost:3000/users/authenticate", user,{headers: headers})
    .map(res => res.json());
  }

  getProfile(){
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken)
    headers.append('Content-Type', 'application/json');

    return this.http.get("http://localhost:3000/users/profile", {headers: headers})
    .map(res => res.json());
  }
  updateMoodle(moodle){
    let headers = new Headers();
    let params = new URLSearchParams();
    this.loadToken();
    console.log(moodle.userId)
    headers.append('Authorization', this.authToken)
    headers.append('Content-Type', 'application/json');
    params.append('id', moodle.userId);
    return this.http.put("http://localhost:3000/users/update", moodle, {headers: headers, params: params})
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
}
