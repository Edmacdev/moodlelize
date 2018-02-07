import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../services/validate.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from '../../services/auth.service';
import { UtilService } from '../../services/util.service';
import { Router } from '@angular/router';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user: object;

  constructor(
    private validateService: ValidateService,
    private flashMessage:FlashMessagesService,
    private authService: AuthService,
    private utilService: UtilService,
    private router:Router
  ) { }

  ngOnInit() {
    this.utilService.currentUser.subscribe(
      user => {this.user = user}
     )
  }

  onLogoutClick(){
    this.authService.logout();
    this.flashMessage.show('Você deslogou', {
      cssClass:'alert-success',
      timeout: 3000
    });
    this.router.navigate(['']);
    return false;
  }

}
