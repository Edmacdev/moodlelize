import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { AuthService } from './auth.service';

@Injectable()
export class UtilService {
  private user = new BehaviorSubject<object>({});
  currentUser = this.user.asObservable();

  constructor(
    private authService: AuthService
  ) { }

  updateUser(){
    this.authService.getProfile().subscribe(
      profile => {
        this.user.next(profile.user);
      },
        err => console.log(err)
    )
  }
}
