import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-users-add',
  templateUrl: './users-add.component.html',
  styleUrls: ['./users-add.component.scss']
})
export class UsersAddComponent implements OnInit {
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  matcher = new MyErrorStateMatcher();
  moodles: [
    {
      url: string,
      name: string,
      token: string
    }
  ]
  moodleIndex: number;
  form_username: string;
  form_password: string;
  form_email: string;
  form_firstname: string;
  form_lastname: string;

  newUser: object;

  constructor(
    private moodleApiService: MoodleApiService,
    private authService: AuthService,
    private flashMessage: FlashMessagesService
  ) { }

  ngOnInit() {
    this.authService.getProfile().subscribe(
      profile => {

        this.moodles = profile.user.moodles;

      },
      err => {
        console.log(err);
        return false;
      }
    )
  }
  onSubmit(){

    let params = {
      wstoken: this.moodles[this.moodleIndex].token,
      username: this.form_username,
      password: this.form_password,
      email: this.form_email,
      firstname: this.form_firstname,
      lastname: this.form_lastname
    }
    this.moodleApiService.core_user_create_users(this.moodles[this.moodleIndex].url, params).subscribe(
      data => {this.newUser = data ; console.log(data)},
      err => {},
      () => {
        if(this.newUser[0].id){
          this.flashMessage.show('Usuário registrado com sucesso', {cssClass: 'alert-success', timeout:3000});
        }
        else {
          this.flashMessage.show('Erro ao registrar usuário', {cssClass: 'alert-danger', timeout:3000});
        }

      }
    )
  }

}
