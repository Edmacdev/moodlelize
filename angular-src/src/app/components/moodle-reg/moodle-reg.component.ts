import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MoodleService } from '../../services/moodle.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

declare var $:any;

@Component({
  selector: 'app-moodle-reg',
  templateUrl: './moodle-reg.component.html',
  styleUrls: ['./moodle-reg.component.scss']
})
export class MoodleRegComponent implements OnInit {

  user:Object;
  userId: String;
  name: String;
  url: String;
  token: String;
  moodles:Object;

  constructor(
    private authService:AuthService,
    private flashMessage:FlashMessagesService,
    private router:Router
  ) { }

  ngOnInit() {
    $('.addItem').hide();

    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user;
      this.moodles = profile.user.moodles;
      this.userId = profile.user._id;

    },
    err => {
      console.log(err);
      return false;
    });
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
      if(data.success){
        this.flashMessage.show('Usuário registrado com sucesso', {cssClass: 'alert-success', timeout:3000});
        document.location.reload(true);
      }else{
        this.flashMessage.show('Erro ao registrar usuário', {cssClass: 'alert-danger', timeout:3000});
        document.location.reload(true);
      }
    });
  }

}
