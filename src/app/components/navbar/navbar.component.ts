import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user: object;

  constructor(
    private authService: AuthService,
    private router:Router
  ) { }

  ngOnInit() {
    this.authService.user.subscribe(
      user => {this.user = user}
     )
  }
}
