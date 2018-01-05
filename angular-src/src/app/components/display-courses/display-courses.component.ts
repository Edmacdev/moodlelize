import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { AuthService } from '../../services/auth.service';
import * as Fuse from 'fuse.js';


@Component({
  selector: 'app-display-courses',
  templateUrl: './display-courses.component.html',
  styleUrls: ['./display-courses.component.scss']
})
export class DisplayCoursesComponent implements OnInit {
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
  courses: Object[] = [];
  result: Object[]= [];

  isResult:Boolean = false;

  constructor(
      private authService:AuthService,
      private moodleApiService:MoodleApiService
  ) { }

  ngOnInit() {

    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user;
    },
    err => {
      console.log(err);
      return false;
    },
    () => {

      const numbOfMoodles = this.user.moodles.length;

      for(let i = 0; i < numbOfMoodles; i++){

        let params = {
          wstoken: this.user.moodles[i].token,
          wsfunction:'core_course_get_courses',
          moodlewsrestformat:'json'
        }
        this.moodleApiService.core_course_get_courses(this.user.moodles[i].url, params).subscribe(data => {
          Object.defineProperty(data, "moodleName", {value:this.user.moodles[i].name});
          this.courses.push(data) ;

          this.result = this.courses;


        })

      }

      this.isResult = true;
    }
  );

  }
  onSubmit(value){

    this.result = [];

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

    for (let i = 0; i < this.user.moodles.length; i++){
      var arr = Object.values(this.courses);
      var fuse = new Fuse(arr[i], options); // "list" is the item array
      var result = fuse.search(value);
      Object.defineProperty(result, "moodleName", {value:this.courses[i].moodleName});
      this.result.push(result)
    }

  }

}
