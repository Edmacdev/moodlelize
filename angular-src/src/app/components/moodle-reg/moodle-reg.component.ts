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
  items = ['Moodle 1', 'Moodle 2', 'Moodle 3']

  user:Object;
  userId: String;
  name: String;
  url: String;
  token: String;

  constructor(
    private authService:AuthService,
    private flashMessage:FlashMessagesService,
    private router:Router
  ) { }

  ngOnInit() {
    $('.addItem').hide();

    this.authService.getProfile().subscribe(profile => {
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
    console.log(moodle)
    this.authService.updateMoodle(moodle).subscribe(data => {
      if(data.success){
        this.flashMessage.show('Moodle registrado com sucesso', {cssClass: 'alert-success', timeout:3000});
        this.router.navigate(['/dashboard'])
      }else{
        this.flashMessage.show('Erro ao registrar moodle', {cssClass: 'alert-danger', timeout:3000});
        this.router.navigate(['/dashboard'])
      }
    })
  }

}
