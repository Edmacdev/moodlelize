import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class MoodleApiService {
wsURL: String = '/webservice/rest/server.php';
wsToken: String = '8672510676f1c09e441042e532b3786a';

  constructor(private http:Http) { }

  core_course_search_courses(criteriaValue){
    const ws_function = 'core_course_search_courses' ;
    const moodle_ws_rest_format = 'json';
    const criteriaName = 'search'

    return this.http.get("https://ead.raleduc.com.br" + this.wsURL + '?' +
    'wstoken=' + this.wsToken +
    '&wsfunction=' + ws_function +
    '&moodlewsrestformat=' + moodle_ws_rest_format +
    '&criterianame=' + criteriaName +
    '&criteriavalue=' + criteriaValue).map(res => res.json());
  }

}
