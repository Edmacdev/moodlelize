import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MoodleService } from '../../services/moodle.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { UtilService } from '../../services/util.service';
import {Observable} from 'rxjs/Rx';
import { MoodleApiService } from '../../services/moodle-api.service';

declare var $:any;

@Component({
  selector: 'app-moodle-reg',
  templateUrl: './moodle-reg.component.html',
  styleUrls: ['./moodle-reg.component.scss']
})
export class MoodleRegComponent implements OnInit {

  step: number = 0;
  userId: string;
  name: string;
  url: string;
  token: string;
  moodles:Object;
  isDoneLoading: Boolean = false;

  constructor(
    private authService:AuthService,
    private flashMessage:FlashMessagesService,
    private router:Router,
    private utilService: UtilService,
    private moodleApiService: MoodleApiService
  ) {
        // utilService.status$.subscribe((newStatus: boolean) => { this.dbStatus = newStatus });
    }

  ngOnInit() {

    $('.addItem').hide();
    this.getUser();

  }
  getUser(){
    this.authService.getProfile().subscribe(
      profile => {

      this.moodles = profile.user.moodles;
      this.userId = profile.user._id;

      },
      err => {
        console.log(err);
        return false;
      },
      () => {
        console.log(this.moodles)
      }
    );
  }
  showDiv(){
    $('.addItem').toggle();
  }
  onAddSubmit(){

    const moodle ={
      name: this.name,
      url: this.url,
      token: this.token
    }

    this.authService.addMoodle(this.userId, moodle).subscribe(
      data => {

      },
      err => {
        this.flashMessage.show('Erro ao registrar moodle', {cssClass: 'alert-danger', timeout:3000});
        document.location.reload(true);
      },
      () => {
        this.getUser();
        this.resetModels();
      }
    );
  }
  removeMoodle(moodleid){
    this.authService.removeMoodle(this.userId, moodleid).subscribe(
      () => {this.getUser()}
    )
  }

  onMoodleSelected(index){
    if(this.statusA[index] == true){
      this.utilService.setMoodleSelected(index);
      alert("moodle " + this.moodles[index].name + "selecionado")
    }
    else alert("Aguarde o carregamento do banco de dados")

  }
  resetModels(){
    this.name = '';
    this.url = '';
    this.token = '';
  }
  // loadDatabase(){
  //   var observablesArray = [];
  //   for (var i in this.moodles){
  //     let params = {
  //       wstoken: this.moodles[i].token,
  //       criteriakey: 'firstname',
  //       criteriavalue: 'ana%',
  //       moodleIndex: i,
  //       moodleName: this.moodles[i].name
  //     }
  //     const request1 = this.moodleApiService.core_user_get_users(this.moodles[i].url, params)
  //     let params2 = {
  //       wstoken: this.moodles[i].token,
  //       moodleIndex: i,
  //       moodleName: this.moodles[i].name
  //     }
  //     const request2 = this.moodleApiService.core_course_get_courses(this.moodles[i].url, params2)
  //     observablesArray.push(request1);
  //     observablesArray.push(request2);
  //   }
  //
  //   Observable.forkJoin(observablesArray)
  //   .subscribe(
  //     data => {
  //       // this.utilService.setMoodleData(data)
  //
  //     },
  //     err => {
  //       console.log(err);
  //       return false;
  //     },
  //     () => {
  //       this.isDoneLoading = true;
  //
  //       console.log('tudo carregado')
  //       }
  //   )
  //   }
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
