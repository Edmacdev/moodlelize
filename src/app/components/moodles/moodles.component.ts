import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MoodleService } from '../../services/moodle.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AddMoodleDialogComponent } from '../add-moodle-dialog/add-moodle-dialog.component';
import { EditMoodleDialogComponent } from '../edit-moodle-dialog/edit-moodle-dialog.component';
import { RemoveMoodleDialogComponent } from '../remove-moodle-dialog/remove-moodle-dialog.component';
import { Observable } from 'rxjs/Rx';
import { Moodle } from '../models/Moodle';
import swal from 'sweetalert';

@Component({
  selector: 'moodles',
  templateUrl: './moodles.component.html',
  styleUrls: ['./moodles.component.scss']
})
export class MoodlesComponent {
  user: any; //usuário logado e autenticado
  moodles: any; //moodloes do usuário
  step: number = 0; //atributo para lógica do material accordion

  //Moodles properties
  add_moodle_name: string;
  add_moodle_url: string;
  add_moodle_token: string;

  isDoneLoading: boolean = false;

  //Forms properties
    fg_add_moodle: FormGroup;

  constructor(
    private authService:AuthService,
    private moodleService:MoodleService,
    private flashMessage:FlashMessagesService,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {
    //Controle de formulário
    this.fg_add_moodle = fb.group({
      'name': [null, Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(30)])],
      'url': [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(30)])],
      'token': [null, Validators.compose([Validators.required, Validators.minLength(32)])]
    })
  }

  ngOnInit() {
    //Buscar informações de usuário
    this.authService.getUser().subscribe(
      user => {
        if(user){
          this.user = user
          this.moodleService.getMoodles(this.user.uid).subscribe(
            moodles => {
              this.moodles = moodles;
            }
          )
        }
      }
    )
  }
  addMoodle(){
    let dialogRef = this.dialog.open(AddMoodleDialogComponent,{
      width: '600px'

    });
    dialogRef.afterClosed().subscribe(
      result => {
        if(result.status == "confirm"){
          this.moodleService.addMoodle(this.user.uid, result.value)
          .then(
              swal('', 'Moodle adicionado', 'success')
          )
        }
      }
    );
  }
  editMoodle(moodle){
    let dialogRef = this.dialog.open(
      EditMoodleDialogComponent,{
        width: '800px',
        data: moodle
      }
    )
    dialogRef.afterClosed().subscribe(
      result => {
        if(result.status == "confirm"){
          this.moodleService.updateMoodle(this.user.uid, result.value.id, result.value)
          .then(
            swal('Moodle Atualizado', '','success')
          )
        }

      }
    )
  }
  removeMoodle(moodle){
    let dialogRef = this.dialog.open(
      RemoveMoodleDialogComponent,{
        width: '800px',
        data:  moodle
      }
    )
    dialogRef.afterClosed().subscribe(
      result => {
        if(result == "confirm"){
          this.moodleService.removeMoodle(this.user.uid, moodle.id)
          .then(
            swal('Moodle Excluido', '', 'success')
          )
        }
      }
    )
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
