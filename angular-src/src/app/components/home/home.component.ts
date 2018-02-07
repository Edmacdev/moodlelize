import { Component, OnInit } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

user: object;
username:string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private utilService: UtilService
  ) { }

  ngOnInit() {
    this.utilService.currentUser.subscribe(
      user => {this.user = user}
    )
  }
  navigate(){
    this.router.navigate(['dashboard']);
  }

}
