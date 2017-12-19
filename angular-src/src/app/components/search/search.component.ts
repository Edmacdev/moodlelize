import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { AuthService } from '../../services/auth.service';

declare var $:any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  results: [Object];
  data: Object;
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
  filter: = "tudo";
  isResult = false;

  constructor(
    private moodleApiService: MoodleApiService,
    private authService: AuthService
  ) { }

  ngOnInit() {

    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user;

    },
    err => {
      console.log(err);
      return false;
    });
  }

  onSubmit(value){
    this.isResult = true;
    this.results = [];

    for( let i = 0; i < this.user.moodles.length; i++){

      switch(this.filter){

        case 'tudo':

          this.moodleApiService.request(this.user.moodles[i].url, params).subscribe(data => {

            if(data){

              this.data = data;
              Object.defineProperty(this.data, "moodle", {value:this.user.moodles[i]});
              this.results.push(this.data);
              console.log(this.results)

            }else{
              console.log('erro');
            }
          });
        break;

        case 'usuários':

          let params = {
            wstoken: this.user.moodles[i].token,
            wsfunction:'core_user_get_users',
            moodlewsrestformat:'json',
            value: value,
            criteria: ['firstname', 'lastname','username', 'email']
          }

          this.moodleApiService.core_user_get_users(this.user.moodles[i].url, params).subscribe(data => {
            if(data){

              this.data = data;
              Object.defineProperty(this.data, "moodle", {value:this.user.moodles[i]});
              this.results.push(this.data);
              console.log(this.results)
            }else{
              console.log('erro');
            }
          });

        break;

      case 'cursos':

        let params = {
          wstoken: this.user.moodles[i].token,
          wsfunction:'core_course_search_courses',
          moodlewsrestformat:'json',
          criterianame: 'search',
          criteriavalue: value
        }

        this.moodleApiService.core_course_search_courses(this.user.moodles[i].url, params).subscribe(data => {
          if(data){

            this.data = data;
            Object.defineProperty(this.data, "moodle", {value:this.user.moodles[i]});
            this.results.push(this.data);
            console.log(this.results)
          }else{
            console.log('erro');
          }
        });
        break;
      }
    }

  }
}
