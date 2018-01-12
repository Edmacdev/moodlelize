import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  user:Object;
  index:number;

  isMoodleSelected: Boolean = false;

  constructor(
    private authService: AuthService,
    private router:ActivatedRoute,
    private utilService: UtilService
  ) { }

  ngOnInit() {

    this.utilService.currentIsMoodleSelected.subscribe(
      status => this.isMoodleSelected = status
    )

    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user;

    },
    err => console.log(err)
    );

    this.router.params.subscribe(params => {
      this.index = +params['i'];
    })

  }


}
