import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { MoodleService } from '../../services/moodle.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.scss']
})
export class CoursePageComponent implements OnInit {
  user: any;
  moodles: any[];
  constructor(
    private moodleApi: MoodleApiService,
    private moodleService: MoodleService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // this.authService.getUser().subscribe(
    //   user => {
    //     if(user){
    //       this.user = user;
    //       this.moodleService.getMoodles(this.user.uid).subscribe(
    //         moodles => {
    //           this.moodles = moodles;
    //         },
    //         () => {
    //           this.moodleApi.core_course_get_courses(this)
    //         }
    //       )
    //     }
    //   }
    // )
    //
  }

}
