import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { AuthService } from '../services/auth.service';

@Injectable()
export class MoodleApiService {
wsURL: String = '/webservice/rest/server.php';

// wsToken: String = '8672510676f1c09e441042e532b3786a';

  constructor(
    private http:Http,
    private authService: AuthService
  ) { }

  core_course_search_courses(host, token, criteriaValue){
    const ws_function = 'core_course_search_courses' ;
    const moodle_ws_rest_format = 'json';
    const criteriaName = 'search'

    return this.http.get("https://" + host + this.wsURL + '?' +

    'wstoken=' + token +
    '&wsfunction=' + ws_function +
    '&moodlewsrestformat=' + moodle_ws_rest_format +
    '&criterianame=' + criteriaName +
    '&criteriavalue=' + criteriaValue).map(res => res.json());
  }

  core_user_view_user_list(host, token, courseid){

  }
  request(host, token, wsfunction, params){
    return this.http.get("https://" + host + this.wsURL + '?' + params)

  }

}
