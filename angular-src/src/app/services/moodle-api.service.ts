import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

@Injectable()
export class MoodleApiService {


  constructor(private http:Http) { }

  core_user_view_user_profile(){
    let headers = new Headers();
    headers.append('Content-Type', 'x-www-form-urlencoded');
    
  }

}
