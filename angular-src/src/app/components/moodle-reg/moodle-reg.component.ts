import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MoodleService } from '../../services/moodle.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { UtilService } from '../../services/util.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EditMoodleDialogComponent } from '../edit-moodle-dialog/edit-moodle-dialog.component';
import { RemoveMoodleDialogComponent } from '../remove-moodle-dialog/remove-moodle-dialog.component';
import {Observable} from 'rxjs/Rx';
import { Moodle } from '../models/Moodle';

@Component({
  selector: 'moodle-reg',
  templateUrl: './moodle-reg.component.html',
  styleUrls: ['./moodle-reg.component.scss']
})
export class MoodleRegComponent implements OnInit {

  user: any;
  moodles: any;
  step: number = 0;


//Moodles properties
  add_moodle_name: string;
  add_moodle_url: string;
  add_moodle_token: string;

  update_moodle_name: string;
  update_moodle_url: string;
  update_moodle_token: string;

  isDoneLoading: Boolean = false;

  //Forms properties

    fg_add_moodle: FormGroup;
    post: any;
    description: string = '';
    name: string = '';

  constructor(
    private authService:AuthService,
    private moodleService:MoodleService,
    private flashMessage:FlashMessagesService,
    private utilService: UtilService,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {
    this.fg_add_moodle = fb.group({
      'name': [null, Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(30)])],
      'url': [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(30)])],
      'token': [null, Validators.compose([Validators.required, Validators.minLength(32)])]
    })
  }

  ngOnInit() {
    this.authService.getUser().subscribe(
      user => {
        this.user = user
        this.moodleService.getMoodles(this.user.uid).subscribe(
          moodles => {
            this.moodles = moodles;
            console.log(this.moodles)
          }
        )
      }
    )
  }
  addMoodle(){
    const moodle={
      name: this.add_moodle_name,
      url: this.add_moodle_url,
      token: this.add_moodle_token
    }
    this.moodleService.addMoodle(this.user.uid, moodle);
    this.fg_add_moodle.reset();
    this.moodleService.getMoodles(this.user.uid)
  }
  editMoodle(moodle){
    console.log(moodle)
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
        }
      }
    )
  }
  // resetF(){
  //   this.fg_add_moodle.reset();
  //   console.log(this.fg_add_moodle)
  // }
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
