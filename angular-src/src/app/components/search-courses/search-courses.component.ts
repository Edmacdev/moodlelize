import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';

@Component({
  selector: 'app-search-courses',
  templateUrl: './search-courses.component.html',
  styleUrls: ['./search-courses.component.scss']
})
export class SearchCoursesComponent implements OnInit {
  results: [Object];
  constructor(private moodleApiService: MoodleApiService) { }

  ngOnInit() {
  }
  onSubmit(value){
    this.moodleApiService.core_course_search_courses(value).subscribe(data => {
      if(data){

        this.results = data.courses;
        console.log(data.courses)
      }else{
        console.log('erro');
      }
    });
  }

}
