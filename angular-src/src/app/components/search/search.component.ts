import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { AuthService } from '../../services/auth.service';
import {Observable} from 'rxjs/Rx'
import 'rxjs/add/observable/concat';
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/distinct";
import "rxjs/add/operator/merge";



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

      switch(this.filter){
        case 'tudo':
        break;

        case 'usuários':

          let userParams = {
            wstoken: this.user.moodles[0].token,
            wsfunction:'core_user_get_users',
            moodlewsrestformat:'json',
            value: value,
          }
          const req_firstname$ = this.moodleApiService.core_user_get_users(this.user.moodles[0].url, userParams, 'firstname' );
          const req_lastname$ = this.moodleApiService.core_user_get_users(this.user.moodles[0].url, userParams, 'lastname' );
          const req_username$ = this.moodleApiService.core_user_get_users(this.user.moodles[0].url, userParams, 'username' );
          const req_email$ = this.moodleApiService.core_user_get_users(this.user.moodles[0].url, userParams, 'email' );
          const combined$ = Observable.merge(
            req_firstname$,
            req_lastname$,
            req_username$,
            req_email$

            // (...arrays) => arrays.reduce((acc, array) => [...acc, ...array], [])
          )
          .map(x => x.users).distinct()

          combined$.subscribe(data => {
            // this.data = data;


            // Object.defineProperty(data.users, "moodleName", {value:this.user.moodles[0].name});

            this.results.push(data);
            console.log(this.results)
            // console.log(typeof(this.results[0].users))

              // console.log(data)
              // console.log(this.results)
          })
            // this.moodleApiService.core_user_get_users(this.user.moodles[i].url, userParams, j, name).subscribe(data => {
            //
            //   this.data = data;
            //
            //   Object.defineProperty(this.data.users, "moodleName", {value:this.user.moodles[i].name});
            //   this.results.push(this.data)
            // });

          // }

          // console.log(this.results.length)
          // console.log(this.results.users.length)
          // this.results = this.dataFilter(this.results)
          // console.log(this.results)

        break;

        case 'cursos':

          let courseParams = {
            wstoken: this.user.moodles[0].token,
            wsfunction:'core_course_search_courses',
            moodlewsrestformat:'json',
            criterianame: 'search',
            criteriavalue: value
          }

          this.moodleApiService.core_course_search_courses(this.user.moodles[0].url, courseParams).subscribe(data => {
            if(data){

              this.data = data;
              Object.defineProperty(this.data, "moodle", {value:this.user.moodles[0]});
              this.results.push(this.data);
              console.log(this.results)
            }else{
              console.log('erro');
            }
          });
        break;

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
