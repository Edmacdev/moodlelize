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
  reg_email: string;
  reg_password: string;
  reg_confirm_password: string;

  constructor(
    private validateService: ValidateService,
    private flashMessage:FlashMessagesService,
    private authService: AuthService,
    private router:Router
  ) {}

  ngOnInit() {
  //inicia o código de interação com o formulário
    this.form();
  }
  //Registro de usuário
  onRegisterSubmit() {
    const user = {
      email: this.reg_email,
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
    //Faz a confirmação de senha
    if(!this.validateService.validateConfirmPassword(user.password, user.confirm_password)){
      this.flashMessage.show('A senha não foi confirmada corretamente', {cssClass: 'alert-danger', timeout:3000});
      return false;
    }
    //Register user
    this.authService.registerUser(user.email, user.password)
      .then(data => {
          this.flashMessage.show('Usuário registrado com sucesso', {cssClass: 'alert-success', timeout:3000});
          document.location.reload(true);
      })
      .catch(
        e => {
          switch(e.code){
            case 'auth/email-already-in-use':
              this.flashMessage.show('O email cadastrado já existe', {cssClass: 'alert-danger', timeout:3000});
            break
            case 'auth/invalid-email':
              this.flashMessage.show('O email cadastrado é inválido', {cssClass: 'alert-danger', timeout:3000});
            break
            default:
              console.log(e)
            break
          }
        }
      )
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
        user => {
          this.authService.updateUserData(user)
        }
      )
      .catch(e => {
        if (e.code == "auth/invalid-email"){
          this.flashMessage.show('O email digitado é inválido', {cssClass: 'alert-danger', timeout:3000});
          return false;
        }
        else if(e.code == "auth/wrong-password"){
          this.flashMessage.show('A senha está incorreta', {cssClass: 'alert-danger', timeout:3000});
          return false;
        }
        else if(e.code == "auth/user-not-found"){
          this.flashMessage.show('Usuário não existe', {cssClass: 'alert-danger', timeout:3000});
        }
        else {console.log(e)}
      })
  }
//formulario
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
