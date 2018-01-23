import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { UtilService } from '../../services/util.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EditMoodleDialogComponent } from '../edit-moodle-dialog/edit-moodle-dialog.component';
import { RemoveMoodleDialogComponent } from '../remove-moodle-dialog/remove-moodle-dialog.component';
import {Observable} from 'rxjs/Rx';

@Component({
  selector: 'moodle-reg',
  templateUrl: './moodle-reg.component.html',
  styleUrls: ['./moodle-reg.component.scss']
})
export class MoodleRegComponent implements OnInit {

  user: any;
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

    rForm: FormGroup;
    rFormA: FormGroup[] = [];
    post: any;
    description: string = '';
    name: string = '';

  constructor(
    private authService:AuthService,
    private flashMessage:FlashMessagesService,
    private utilService: UtilService,
    private fb: FormBuilder,
    public dialog: MatDialog,
  ) {
    this.rForm = fb.group({
      'name': [null, Validators.required],
      'url': [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(30)])],
      'token': [null, Validators.required]
    })
  }

  ngOnInit() {

    this.utilService.currentUser.subscribe(
      profile => {
        this.user = profile;
      }

    )
  }
  onAddSubmit(){
    const moodle ={
      name: this.add_moodle_name,
      url: this.add_moodle_url,
      token: this.add_moodle_token
    }

    this.authService.addMoodle(this.user._id, moodle).subscribe(
      () => {
        this.utilService.updateUser()
        this.resetModels();
      }
    );
  }
  onUpdateSubmit(post, moodleid){
    console.log(post.value)
    // const moodle ={
    //   name: post.name,
    //   url: post.url,
    //   token: post.token
    // }
    // this.authService.removeMoodle(this.user._id, moodleid).subscribe(
    //   () => {this.utilService.apdateUser()}
    // )

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
          this.authService.updateMoodle(this.user._id, result.value).subscribe(
            () => {this.utilService.updateUser()}
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
          this.authService.removeMoodle(this.user._id, moodle._id).subscribe(
            () => {this.utilService.updateUser()}
          )
        }
      }
    )
  }
  resetModels(){
    this.add_moodle_name = '';
    this.add_moodle_url = '';
    this.add_moodle_token = '';
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
