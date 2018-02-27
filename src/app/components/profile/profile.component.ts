import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user:object;
  constructor(private authService:AuthService, private router:Router) { }

  ngOnInit() {

    this.authService.getUser().subscribe(user => {
      this.user = user
      console.log(this.user)

    },
    err => {
      console.log(err);
      return false;
    });

  }

}
