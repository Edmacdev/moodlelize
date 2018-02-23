import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { MoodleService } from '../../services/moodle.service';
import { AuthService } from '../../services/auth.service';
import { DataShareService } from '../../services/data-share.service';

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.scss']
})
export class CoursePageComponent implements OnInit {
  course: object;
  constructor(
    private moodleApi: MoodleApiService,
    private moodleService: MoodleService,
    private authService: AuthService,
    private dataShare: DataShareService
  ) { }

  ngOnInit() {
    this.course = this.dataShare.getData();
    console.log(this.course)
  }

}
