import { Injectable } from '@angular/core';

@Injectable()
export class ValidateService {

  constructor() { }

  validateRegister(user){
    if(user.email == undefined || user.username == undefined || user.password == undefined || user.confirm_password == undefined){
      return false
    }else{
      return true;
    }
  }

  validateEmail(email){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  validateConfirmPassword(password, confirm_password){
    if(password === confirm_password){
      return true;
    }else return false;
  }
  validateLogin(user){
    if(user.email == undefined || user.password == undefined){
      return false;
    }else return true;
  }
}
