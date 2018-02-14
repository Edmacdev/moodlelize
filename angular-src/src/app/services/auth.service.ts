import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AnuglarFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import { Http, Headers, RequestOptions } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AngularFirestore } from 'angularfire2/firestore';

interface User{
  uid: string;
  email: string;
  displayName?: string;
  moodles?: [
    {
      nome: string,
      url: string,
      token: string
    }
}
@Injectable()
export class AuthService {

  user: Observable<User>;

   constructor(
     private http: Http,
     private db: AngularFirestore,
     private afAuth: AngularFireAuth,
     private afStore: AngularFirestore,
     private router: Router
   ) {
     this.user = this.afAuth.authState
     .switchMap(
       user => {
         if(user){
           return this.afStore.doc<User>('Usuários/' + user.uid).valueChanges()
         }else{
           return Observable.of(null)
         }
      })
   }
   googleLogin(){
     const provider = new firebase.auth.GoogleAuthProvider()

     return this.oAuthLogin(provider);
   }
   private oAuthLogin(provider){

     return this.afAuth.auth.signInWithPopup(provider)
     .then((credential) => {

       this.updateUserData(credential.user)
     })
     .catch(e => console.error(e))
   }
   private updateUserData(user){
     console.log(user)
     const userRef: AngularFirestoreDocument<User> = this.afStore.doc('Usuários/'+ user.uid);
     const data: User = {
       uid: user.uid,
       email: user.email,
       displayName: user.displayName
     }

     return userRef.set(data);
     // this.router.navigate(['dashboard']);
   }

   signIn(username, password){
    return this.afAuth.signInWithEmailAndPassword(username, password);
   }
   signOut(){
     return this.afAuth.auth.signOut();
   }
  registerUser(email, password){
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }
  //Moodle
  addMoodle(uid:string, moodle: object){

  const userRef: AngularfirestoreDocument<User> = this.afStore.doc('Usuários/' + uid);
    return userRef.set(moodle, {merge: true})
  }

}
