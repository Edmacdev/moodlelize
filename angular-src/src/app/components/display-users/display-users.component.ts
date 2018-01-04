import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-display-users',
  templateUrl: './display-users.component.html',
  styleUrls: ['./display-users.component.scss']
})
export class DisplayUsersComponent implements OnInit {
  userAdmin: {
    email: {
      type: String,
      require: true
    },
    username: {
      type: String,
      require: true
    },
    password: {
      type: String,
      required: true
    },
    moodles: [
      {
        url: String,
        name: String,
        token:String
      }
    ]
  };
  users: Object[] = [];
  isResult:Boolean = false;
  constructor(
    private authService:AuthService,
    private moodleApiService:MoodleApiService
  ) { }

  ngOnInit() {
    this.authService.getProfile().subscribe(profile => {
      this.userAdmin = profile.user;
    },
    err => {
      console.log(err);
      return false;
    },
    () => {

      const numbOfMoodles = this.userAdmin.moodles.length;

      for(let i = 0; i < numbOfMoodles; i++){
        let params = {
          wstoken: this.userAdmin.moodles[i].token,
          wsfunction:'core_user_get_users',
          moodlewsrestformat:'json',
          criteriakey: 'firstname',
          criteriavalue: '%ana%'
        }
        this.moodleApiService.core_user_get_users(this.userAdmin.moodles[i].url, params).subscribe(data => {
          Object.defineProperty(data, "moodleName", {value:this.userAdmin.moodles[i].name});
          this.users.push(data) ;
          console.log(this.users);
        })
      }
      this.isResult = true;
    }
    );
  }
}
