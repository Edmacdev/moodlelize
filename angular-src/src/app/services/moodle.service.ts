import { Injectable } from '@angular/core';

@Injectable()
export class MoodleService {

  constructor() { }

  validateRegister(moodle){
    if(moodle.name == undefined || moodle.url == undefined || moodle.token == undefined ){
      return false
    }else{
      return true;
    }
  }
  

}
