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

  userId: String;
  name: String;
  url: String;
  token: String;
  moodles:Object;
  status:boolean;
  isDoneLoading: Boolean = false;

  moodleIsSelected:Boolean = false;

  statusA: Boolean[] = [false,false];

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

    this.utilService.currentStatus1.subscribe(status => {this.statusA[0] = status;})
    this.utilService.currentStatus2.subscribe(status => {this.statusA[1] = status;})


    $('.addItem').hide();

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
        // this.loadDatabase();
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

    this.authService.updateMoodle(this.userId, moodle).subscribe(
      data => {

        this.flashMessage.show('Moodle registrado com sucesso', {cssClass: 'alert-success', timeout:3000});
        document.location.reload(true);
      },
      err => {
        this.flashMessage.show('Erro ao registrar moodle', {cssClass: 'alert-danger', timeout:3000});
        document.location.reload(true);
      }
    );
  }
  // onRemoveMoodle(this.userId, this.moodles ){
  // }

  onMoodleSelected(index){
    if(this.statusA[index] == true){
      this.utilService.setMoodleSelected(index);
      alert("moodle " + this.moodles[index].name + "selecionado")
    }
    else alert("Aguarde o carregamento do banco de dados")

  }
  loadDatabase(){
    var observablesArray = [];
    for (var i in this.moodles){
      let params = {
        wstoken: this.moodles[i].token,
        criteriakey: 'firstname',
        criteriavalue: 'ana%',
        moodleIndex: i,
        moodleName: this.moodles[i].name
      }
      const request1 = this.moodleApiService.core_user_get_users(this.moodles[i].url, params)
      let params2 = {
        wstoken: this.moodles[i].token,
        moodleIndex: i,
        moodleName: this.moodles[i].name
      }
      const request2 = this.moodleApiService.core_course_get_courses(this.moodles[i].url, params2)
      observablesArray.push(request1);
      observablesArray.push(request2);
    }

    Observable.forkJoin(observablesArray)
    .subscribe(
      data => {
        // this.utilService.setMoodleData(data)

      },
      err => {
        console.log(err);
        return false;
      },
      () => {
        this.isDoneLoading = true;

        console.log('tudo carregado')
        }
    )
    }


}
