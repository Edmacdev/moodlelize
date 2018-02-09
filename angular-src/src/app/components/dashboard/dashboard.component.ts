import { Component, OnInit } from '@angular/core';
import { UtilService } from '../../services/util.service';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  constructor(
    private utilService: UtilService,
    private firebaseDB: AngularFrestore
  ) {
    
  }

  ngOnInit() {
    // this.utilService.updateUser();
  }
}
