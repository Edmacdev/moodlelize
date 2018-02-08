import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../services/validate.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

declare var $:any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  log_email: string;
  log_password: string;
  reg_username: string;
  reg_email: string;
  reg_password: string;
  reg_confirm_password: string

  constructor(
    private validateService: ValidateService,
    private flashMessage:FlashMessagesService,
    private authService: AuthService,
    private router:Router
  ) {}

  ngOnInit() {
    this.form();

  }
  onRegisterSubmit() {

    const user = {
      email: this.reg_email,
      username: this.reg_username,
      password: this.reg_password,
      confirm_password: this.reg_confirm_password
    }
    //Required Fields
    if(!this.validateService.validateRegister(user)){
      this.flashMessage.show('Por favor preencha todos os campos', {cssClass: 'alert-danger', timeout:3000});
      return false;
    }

    //Validate Email
    if(!this.validateService.validateEmail(user.email)){
      this.flashMessage.show('Por favor use um email válido', {cssClass: 'alert-danger', timeout:3000});

      return false;
    }

    if(!this.validateService.validateConfirmPassword(user.password, user.confirm_password)){
      this.flashMessage.show('A senha não foi confirmada corretamente', {cssClass: 'alert-danger', timeout:3000});
      return false;
    }
    //Register user
    this.authService.registerUser(user.email, user.password).subscribe(data => {
      if(data.success){
        this.flashMessage.show('Usuário registrado com sucesso', {cssClass: 'alert-success', timeout:3000});
        document.location.reload(true);
      }else{
        this.flashMessage.show('Erro ao registrar usuário', {cssClass: 'alert-danger', timeout:3000});
        this.router.navigate(['']);
      }
    });
  }
  onLoginSubmit(){
    const user = {
      email: this.log_email,
      password: this.log_password
    }
    //Required Fields
    if(!this.validateService.validateLogin(user)){
      this.flashMessage.show('Por favor preencha todos os campos', {cssClass: 'alert-danger', timeout:3000});

      return false;
    }

    this.authService.signIn(user.email, user.password)
    .then(
      data => {console.log(data)}
    )
    .catch(
      e => {console.error(e)}
    )
  }

  form(){
    $('#login-form-link').click(function(e) {
      $("#login-form").delay(100).fadeIn(100);
      $("#register-form").fadeOut(100);
      $('#register-form-link').removeClass('active');
      $(this).addClass('active');
      e.preventDefault();
    });
    $('#register-form-link').click(function(e) {
      $("#register-form").delay(100).fadeIn(100);
      $("#login-form").fadeOut(100);
      $('#login-form-link').removeClass('active');
      $(this).addClass('active');
      e.preventDefault();
    });
  }
}
