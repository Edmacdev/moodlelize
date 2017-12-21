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

  results: Object[];
  data: {
    users:[Object];
  }
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
  filter: String;
  isResult = false;

  constructor(
    private moodleApiService: MoodleApiService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.filter = 'tudo'
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
        break;

        // case 'usuário':
        //
        //   let userParams = {
        //     wstoken: this.user.moodles[i].token,
        //     wsfunction:'core_user_get_users',
        //     moodlewsrestformat:'json',
        //     value: value,
        //     criteria: ['firstname','lastname', 'email']
        //   }
        //
        //   this.moodleApiService.core_user_get_users(this.user.moodles[i].url, userParams).subscribe(data => {
        //     if(data){
        //           this.data = data;
        //           this.results.push(this.data)
        //           Object.defineProperty(this.data, "moodle", {value:this.user.moodles[i]});
        //         }else{
        //           console.log('erro');
        //         }
        //         console.log(this.results)
        //     });
        //
        // break;

        case 'usuários':

          let userParams = {
            wstoken: this.user.moodles[i].token,
            wsfunction:'core_user_get_users',
            moodlewsrestformat:'json',
            value: value,
            criteria: ['firstname','lastname', 'email','username']
          }

          for(var j = 0; j < userParams.criteria.length ; j++){

            this.moodleApiService.core_user_get_users(this.user.moodles[i].url, userParams, j, name).subscribe(data => {

              this.data = data;

              Object.defineProperty(this.data.users, "moodleName", {value:this.user.moodles[i].name});
              this.results.push(this.data)
            });

          }

          console.log(this.results.length)
          // console.log(this.results.users.length)
          // this.results = this.dataFilter(this.results)
          // console.log(this.results)

        break;

        case 'cursos':

          let courseParams = {
            wstoken: this.user.moodles[i].token,
            wsfunction:'core_course_search_courses',
            moodlewsrestformat:'json',
            criterianame: 'search',
            criteriavalue: value
          }

          this.moodleApiService.core_course_search_courses(this.user.moodles[i].url, courseParams).subscribe(data => {
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
  dataFilter(data){

    for (let j = 0; j<data.length; j++ ){
      if(data[j].users.length == 0){
        data.slice(j);
      }
    }
    return data;
  }
}
