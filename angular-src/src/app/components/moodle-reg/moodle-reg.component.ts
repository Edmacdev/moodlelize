import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MoodleService } from '../../services/moodle.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { UtilService } from '../../services/util.service';


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

  statusA: Boolean[] = [];

  constructor(
    private authService:AuthService,
    private flashMessage:FlashMessagesService,
    private router:Router,
    private utilService: UtilService
  ) {
        // utilService.status$.subscribe((newStatus: boolean) => { this.dbStatus = newStatus });
    }

  ngOnInit() {

    this.utilService.currentStatus.subscribe(status => {
      this.status = status;
    })

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
     // this.utilService.initMoodlesStatus(this.moodles);

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

    this.authService.updateMoodle(this.userId, moodle).subscribe(data => {
      if(data){
        this.flashMessage.show('Moodle registrado com sucesso', {cssClass: 'alert-success', timeout:3000});
        document.location.reload(true);
      }else{
        this.flashMessage.show('Erro ao registrar moodle', {cssClass: 'alert-danger', timeout:3000});
        document.location.reload(true);
      }
    });
  }

}
