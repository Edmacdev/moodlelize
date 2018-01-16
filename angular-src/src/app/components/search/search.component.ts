import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs/Rx';
import * as Fuse from 'fuse.js';

declare var $:any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  moodles: [
    {
      url: string,
      name: string,
      token: string
    }
  ]
  isCoursesResult: boolean = false;
  isUsersResult: boolean = false;

  courses: object[] = [];
  result: object[] = [];
  users: object[] = [];

  moodleIndex: number;

  form_query: string ="";
  form_field: string ="";
  form_moodle: string ="";

  constructor(
    private authService: AuthService,
    private moodleApiService: MoodleApiService
  ){}

  ngOnInit() {
    this.authService.getProfile().subscribe(
      profile => {
        this.moodles = profile.user.moodles;
      },
      err => {
        console.log(err);
        return false;
      }
    )
  }
  onSubmit(query, field, moodleIndex){
    this.moodleIndex = moodleIndex;
    var params;

    switch(field){
      case 'users':
        params ={
          wstoken: this.moodles[moodleIndex].token,
          criteriakey:'firstname',
          criteriavalue: query + '%'
        }
        this.moodleApiService.core_user_get_users(this.moodles[moodleIndex].url, params)
        .subscribe(
          data =>{
            this.users = data;
          },
          err => {
            console.log(err)
            return false
          },
          () => {
            console.log(this.users);
            this.isUsersResult = true;
          };
        )
      break;
      case 'courses':

        if(!this.courses[moodleIndex]){

          params = {
            wstoken: this.moodles[moodleIndex].token
          }

          this.moodleApiService.core_course_get_courses(this.moodles[moodleIndex].url, params)
          .subscribe(
            data => {
              this.courses.splice(moodleIndex, 0, data);
            },
            err => {},
            () => {
              if(query == ''){
                this.result[moodleIndex] = this.courses[moodleIndex];
                console.log(this.result)
              }
              else{
                var options = {
                  shouldSort: true,
                  threshold: 0.3,
                  keys: [
                    "fullname"
                  ]
                };
                let fuse = new Fuse(this.courses[moodleIndex], options);
                this.result[moodleIndex] = fuse.search(query);
              }
              this.isCoursesResult = true;
            }
          )
        }
        else {
          if(query == ''){
            this.result[moodleIndex] = this.courses[moodleIndex];
          }
          else{
            var options = {
              shouldSort: true,
              threshold: 0.3,
              keys: [
                "fullname"
              ]
            };
            let fuse = new Fuse(this.courses[moodleIndex], options);
            this.result[moodleIndex] = fuse.search(query);
            this.isCoursesResult = true;
          }
        }
      break
      default:
        alert('Escolha um campo de pesquisa');
      break
    }
  }
}
