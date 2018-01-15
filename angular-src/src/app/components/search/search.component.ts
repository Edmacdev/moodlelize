import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { AuthService } from '../../services/auth.service';
import {Observable} from 'rxjs/Rx';
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
      url: String,
      name: String,
      token:String
    }
  ]
  isResult: Boolean = false;
  courses: Object;
  result: Object[] = [];
  users: Object;

  form_query ="";
  form_field ="";
  form_moodle ="";

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
    var params;
    switch(field){

      case 'users':
        params ={
          wstoken: this.moodles[moodleIndex].token,
          moodleIndex: moodleIndex,
          moodleName: this.moodles[moodleIndex].name
        }
      //   this.moodleApiService.core_user_get_users(this.moodles[moodleIndex].url, params)
      break;
      case 'courses':
        if(query === ''){
          params = {
            wstoken: this.moodles[moodleIndex].token,
            moodleIndex: moodleIndex,
            moodleName: this.moodles[moodleIndex].name,
            field: '',
            value: query
          }
        }
        else if(query !== ''){
          params ={
            wstoken: this.moodles[moodleIndex].token,
            moodleIndex: moodleIndex,
            moodleName: this.moodles[moodleIndex].name,
            field: 'shortname',
            value: query
          }
        }
        this.moodleApiService.core_course_get_courses_by_field(this.moodles[moodleIndex].url, params)
        .subscribe(
          data => {
            this.courses = data.courses;

          },
          err => {},
          () => {
            var options = {
              shouldSort: true,
              tokenize: false,
              threshold: 0.3,
              location: 0,
              distance: 100,
              maxPatternLength: 32,
              minMatchCharLength: 1,
              keys: [
                "fullname",
              ]
            };
            let arr = Object.values(this.courses);
            let fuse = new Fuse(arr, options);
            let str: String = query;
            this.result = fuse.search(str);
            console.log(this.result)
          }
        )
      break
      default:
        alert('Escolha um campo de pesquisa');
      break

    }

  }
}
