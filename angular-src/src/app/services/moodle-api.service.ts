import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { UtilService } from './util.service'
import 'rxjs/add/operator/map';

@Injectable()
export class MoodleApiService {
wsURL: String = '/webservice/rest/server.php';
wsProtocol: String = 'https://';



  constructor(
    private http:Http,
    private utilService:UtilService
  ) { }

  core_course_get_courses(host, params){

    return this.http.get(this.wsProtocol + host + this.wsURL +
    '?wstoken=' + params.wstoken +
    '&wsfunction=core_course_get_courses' +
    '&moodlewsrestformat=json'

    ).map(res => {
      let obj = res.json();
      Object.defineProperty(obj, "moodleIndex", {value:params.moodleIndex});
      Object.defineProperty(obj, "moodleName", {value:params.moodleName});
      return obj
      })
  }

  core_course_get_courses_by_field(host, params){
    return this.http.get(this.wsProtocol + host + this.wsURL +
    '?wstoken=' + params.wstoken +
    '&wsfunction=core_course_get_courses_by_field' +
    '&moodlewsrestformat=json' +
    '&field=' + params.field +
    '&value=' + params.value
  ).map(res => res.json())
  }

  core_user_get_users(host, params){

    return this.http.get(this.wsProtocol + host + this.wsURL +
    '?wstoken=' + params.wstoken +
    '&wsfunction=core_user_get_users' +
    '&moodlewsrestformat=json' +
    '&criteria[0][key]=' + params.criteriakey +
    '&criteria[0][value]=' + params.criteriavalue
    ).map(res => {

        let obj = res.json();
        Object.defineProperty(obj, "moodleIndex", {value:params.moodleIndex});
        Object.defineProperty(obj, "moodleName", {value:params.moodleName});

        this.utilService.updateStatus(true, params.moodleIndex);

        return obj
      })
  }

  gradereport_overview_get_course_grades(host, params){

    return this.http.get("https://" + host + this.wsURL +
    '?wstoken=' + params.wstoken +
    '&wsfunction=gradereport_overview_get_course_grades' +
    '&moodlewsrestformat=json' +
    '&userid=' + params.userid
    ).map(res => res.json());
  }
  // core_enrol_get_users_courses(host, params){
  //
  //   return this.http.get(this.protocol + host + this.wsURL +
  //   '?wstoken=' + params.wstoken +
  //   '&wsfunction=core_enrol_get_users_courses' +
  //   '&moodlewsrestformat=json' +
  //   '&userid=' + params.userid
  //   ).map(res => res.json());
  // }

}
