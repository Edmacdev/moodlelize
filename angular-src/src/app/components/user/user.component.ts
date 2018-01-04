import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MoodleApiService } from '../../services/moodle-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  user: {
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
  userProfile: Object;

  constructor(
    private route: ActivatedRoute,
    private moodleApiService: MoodleApiService,
    private authService:AuthService
    ) { }

  ngOnInit() {
    var id = this.route.snapshot.params['id'];

    this.authService.getProfile().subscribe(
      profile => this.user = profile.user,
      error =>  console.log(error),
      () => {

        for(let i = 0; i<this.user.moodles.length; i++){
          var params = {
            wstoken: this.user.moodles[i].token,
            wsfunction: 'core_user_get_users',
            moodlewsrestformat: 'json',
            value: this.route.snapshot.params['id']
          }

          this.moodleApiService.core_user_get_users(this.user.moodles[i].url, params, 'id').subscribe(data => {
            this.userProfile = data.users[0];
            console.log(this.userProfile)
          })
        }
      }
    );
  }
}
