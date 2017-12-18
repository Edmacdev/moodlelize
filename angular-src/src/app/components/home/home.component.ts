import { Component, OnInit } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

user:Object;
username:String;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {

    this.getProfile();
    if(this.authService.loggedIn()){
      this.router.navigate(['dashboard']);
    }
  }
  getProfile(){
    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user;
      this.username = profile.user.username

    },
    err => {
      console.log(err);
      return false;
    });
  }

}
