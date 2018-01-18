import { Component, OnInit } from '@angular/core';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  user:object;
  constructor(
    private utilService: UtilService
  ) { }

  ngOnInit() {
    this.utilService.updateUser();
    this.utilService.currentUser.subscribe(
      profile => {
        this.user = profile.user;
      }
    )
  }
}
