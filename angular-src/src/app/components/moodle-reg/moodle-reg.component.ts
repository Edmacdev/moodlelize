import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { UtilService } from '../../services/util.service';
import {Observable} from 'rxjs/Rx';

@Component({
  selector: 'app-moodle-reg',
  templateUrl: './moodle-reg.component.html',
  styleUrls: ['./moodle-reg.component.scss']
})
export class MoodleRegComponent implements OnInit {

  user: any;
  step: number = 0;

  name: string;
  url: string;
  token: string;

  isDoneLoading: Boolean = false;

  constructor(
    private authService:AuthService,
    private flashMessage:FlashMessagesService,
    private utilService: UtilService

  ) {}

  ngOnInit() {
    this.utilService.currentUser.subscribe(
      profile => {this.user = profile; console.log(this.user)}
    )
  }
  onAddSubmit(){
    const moodle ={
      name: this.name,
      url: this.url,
      token: this.token
    }

    this.authService.addMoodle(this.user._id, moodle).subscribe(
      () => {
        this.utilService.updateUser()
        this.resetModels();
      }
    );
  }
  removeMoodle(moodleid){
    this.authService.removeMoodle(this.user._id, moodleid).subscribe(
      () => {this.utilService.updateUser()}
    )
  }
  resetModels(){
    this.name = '';
    this.url = '';
    this.token = '';
  }
  //material
    setStep(index: number) {
      this.step = index;
    }
    nextStep() {
      this.step++;
    }
    prevStep() {
      this.step--;
    }
}
