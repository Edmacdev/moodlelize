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

  core_user_get_users_by_field(host, params){
    // console.log("https://" + host + this.wsURL + '?' +
    // 'wstoken=' + params.wstoken +
    // '&wsfunction=' + params.wsfunction +
    // '&moodlewsrestformat=' + params.moodlewsrestformat +
    // '&field=' + params.field +
    // '&values[0]=' + params.values
    // ))

    return this.http.get("https://" + host + this.wsURL + '?' +

    'wstoken=' + params.wstoken +
    '&wsfunction=' + params.wsfunction +
    '&moodlewsrestformat=' + params.moodlewsrestformat +
    '&field=' + params.field +
    '&values[0]=' + params.values
    ).map(res => res.json());
  }

  core_course_search_courses(host, params){
    return this.http.get("https://" + host + this.wsURL + '?' +

    'wstoken=' + params.wstoken +
    '&wsfunction=' + params.wsfunction +
    '&moodlewsrestformat=' + params.moodlewsrestformat +
    '&criterianame=' + params.criterianame +
    '&criteriavalue=' + params.criteriavalue
    ).map(res => res.json());
  }

  core_user_get_users(host, params){
    return this.http.get("https://" + host + this.wsURL + '?' +
    'wstoken=' + params.wstoken +
    '&wsfunction=' + params.wsfunction +
    '&moodlewsrestformat=' + params.moodlewsrestformat +
    '&criteria[0][key]=' + params.criteria[0] +
    '&criteria[0][value]=' + params.value
    '&criteria[1][key]=' + params.criteria[1] +
    '&criteria[1][value]=' + params.value +
    '&criteria[2][key]=' + params.criteria[2] +
    '&criteria[2][value]=' + params.value +
    '&criteria[3][key]=' + params.criteria[3] +
    '&criteria[3][value]=' + params.value 
    ).map(res => res.json());
  }

}
