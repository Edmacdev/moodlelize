import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AngularFirestore } from 'angularfire2/firestore';
@Injectable()
export class AuthService {

  private user = new BehaviorSubject<object>({});
  currentUser = this.user.asObservable();
  fbAuth = null;

   constructor(
     private http: Http,
     private db: AngularFirestore
   ) {
     
   }
   signIn(username, password){
    return this.fbAuth.signInWithEmailAndPassword(username, password);
   }
// User

  registerUser(email, password){
    const promise = this.fbAuth.createUserWithEmailAndPassword(email, password);
    return promise;
  }

  // registerUser(user){
  //   let headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //   return this.http.post(this.protocol + this.host + this.port + '/users/register', user,{headers: headers})
  //   .map(res => res.json());
  // }

 //  authenticateUser(user){
 //    let headers = new Headers();
 //    headers.append('Content-Type', 'application/json');
 //    return this.http.post(this.protocol + this.host + this.port + '/users/authenticate', user,{headers: headers})
 //    .map(res => res.json());
 //  }
 //
 //  getProfile(){
 //    let headers = new Headers();
 //    this.loadToken();
 //    headers.append('Authorization', this.authToken)
 //    headers.append('Content-Type', 'application/json');
 //    return this.http.get(this.protocol + this.host + this.port + '/users/profile', {headers: headers})
 //    .map(res => res.json());
 //  }
 //  storeUserData(token, user){
 //    localStorage.setItem('id_token', token);
 //    localStorage.setItem('user', JSON.stringify(user));
 //    this.authToken = token;
 //    this.user = user;
 //  }
 //
 //  loadToken(){
 //    const token = localStorage.getItem('id_token');
 //    this.authToken = token;
 //  }
 //
 //  loggedIn() {
 //
 //  }
 //
 //  logout(){
 //    this.authToken = null;
 //    this.user = null;
 //    localStorage.clear();
 //  }
 //  prepEndpoint(ep){
 //   if(this.isDev){
 //     return ep;
 //   } else {
 //     return 'http://localhost:8080/'+ep;
 //   }
 // }
 //
 //  //Moodle
 //  addMoodle(id, moodle){
 //    let headers = new Headers();
 //    let options = new RequestOptions({ headers: headers });
 //    headers.append('Content-Type', 'application/json');
 //    let body = JSON.stringify(moodle);
 //    return this.http.put("http://localhost:3000/users/moodle/add/" + id, body, options)
 //    .map(res => res.json());
 //  }
 //  updateMoodle(id, moodle){
 //    let headers = new Headers();
 //    let options = new RequestOptions({ headers: headers });
 //    headers.append('Content-Type', 'application/json');
 //    let body = JSON.stringify(moodle);
 //    return this.http.put("http://localhost:3000/users/moodle/update/" + id + '/' + moodle._id, body, options)
 //    .map(res => res.json());
 //  }
 //  removeMoodle(id, moodleid){
 //    let headers = new Headers();
 //    let options = new RequestOptions({ headers: headers });
 //    headers.append('Content-Type', 'application/json');
 //    return this.http.put("http://localhost:3000/users/moodle/remove/" + id + '/' + moodleid, options)
 //    .map(res => res.json());
 //  }
}
