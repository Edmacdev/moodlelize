import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';

@Component({
  selector: 'app-search-courses',
  templateUrl: './search-courses.component.html',
  styleUrls: ['./search-courses.component.scss']
})
export class SearchCoursesComponent implements OnInit {

  constructor(private moodleApiService: MoodleApiService) { }

  ngOnInit() {
  }
  onSubmit(name, value){
    this.moodleApiService.core_course_search_courses(name, value);
  }

}
