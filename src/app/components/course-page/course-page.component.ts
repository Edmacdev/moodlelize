import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.scss']
})
export class CoursePageComponent implements OnInit {

  constructor(
    private moodleApi: MoodleApiService
  ) { }

  ngOnInit() {
    // this.moodleApi.
  }

}
