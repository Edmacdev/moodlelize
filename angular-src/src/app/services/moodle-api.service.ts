import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { UtilService } from './util.service'
import 'rxjs/add/operator/map';

@Injectable()
export class MoodleApiService {
wsURL: string = '/webservice/rest/server.php';
wsProtocol: string = 'https://';



  constructor(
    private http:Http,
    private utilService:UtilService
  ) { }

  core_course_get_courses(host, params){

    return this.http.get(this.wsProtocol + host + this.wsURL +
    '?wstoken=' + params.wstoken +
    '&wsfunction=core_course_get_courses' +
    '&moodlewsrestformat=json'

    ).map(res => res.json())
  }

  // core_course_get_courses_by_field(host, params){
  //   return this.http.get(this.wsProtocol + host + this.wsURL +
  //   '?wstoken=' + params.wstoken +
  //   '&wsfunction=core_course_get_courses_by_field' +
  //   '&moodlewsrestformat=json' +
  //   '&field=' + params.field +
  //   '&value=' + params.value
  // ).map(res => res.json())
  // }

  core_user_get_users(host, params){

    return this.http.get(this.wsProtocol + host + this.wsURL +
    '?wstoken=' + params.wstoken +
    '&wsfunction=core_user_get_users' +
    '&moodlewsrestformat=json' +
    '&criteria[0][key]=' + params.criteriakey +
    '&criteria[0][value]=' + params.criteriavalue +
    params.extra
    ).map(res => res.json())
  }
  core_user_create_users(host, params){
    return this.http.get(this.wsProtocol + host + this.wsURL +
    '?wstoken=' + params.wstoken +
    '&wsfunction=core_user_create_users' +
    '&moodlewsrestformat=json' +
    '&users[0][username]=' + params.username +
    '&users[0][password]=' + params.password +
    '&users[0][firstname]=' + params.firstname +
    '&users[0][lastname]=' + params.lastname +
    '&users[0][email]=' + params.email
    ).map(res => res.json())
  }

  gradereport_overview_get_course_grades(host, params){

    return this.http.get("https://" + host + this.wsURL +
    '?wstoken=' + params.wstoken +
    '&wsfunction=gradereport_overview_get_course_grades' +
    '&moodlewsrestformat=json' +
    '&userid=' + params.userid
    ).map(res => res.json());
  }

}
