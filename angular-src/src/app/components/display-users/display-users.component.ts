import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DisplayUsersDialogComponent } from '../display-users-dialog/display-users-dialog.component';
import * as Fuse from 'fuse.js'

@Component({
  selector: 'app-display-users',
  templateUrl: './display-users.component.html',
  styleUrls: ['./display-users.component.scss']
})
export class DisplayUsersComponent implements OnInit {
  user: {
    email: {
      type: String,
      require: true
    },
    username: {
      type: String,
      require: true
    },
    password: {
      type: String,
      required: true
    },
    moodles: [
      {
        url: String,
        name: String,
        token:String
      }
    ]
  };
  users: Object[] = [];
  result: Object[] = [];
  isDoneLoading: Boolean = false;
  isResult: Boolean = false;
  dialogResult = "";

  constructor(
    private authService:AuthService,
    private moodleApiService:MoodleApiService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.authService.getProfile().subscribe(
      profile => {this.user = profile.user;},
      err => {
        console.log(err);
        return false;
      },
      () => {

        const numbOfMoodles = this.user.moodles.length;

        for(let i = 0; i < numbOfMoodles; i++){
          let params = {
            wstoken: this.user.moodles[i].token,
            wsfunction:'core_user_get_users',
            moodlewsrestformat:'json',
            criteriakey: 'firstname',
            criteriavalue: 'ana'
          }
          this.moodleApiService.core_user_get_users(this.user.moodles[i].url, params).subscribe(
            data => {
              Object.defineProperty(data.users, "moodleName", {value:this.user.moodles[i].name});
              this.users.push(data.users) ;
              console.log(this.users)

            },
            err => {
              console.log(err);
              return false;
            },
            () => {this.isDoneLoading = true;}
          )
        }
      }
    );
  }
  onSubmit(value){

    this.result = [];

    var options = {
    shouldSort: true,
    tokenize: false,
    threshold: 0.3,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      "fullname",
    ]
  };

    for (let i = 0; i < this.user.moodles.length; i++){
      var arr = Object.values(this.users);
      var fuse = new Fuse(arr[i], options); // "list" is the item array
      var result = fuse.search(value);
      // Object.defineProperty(result, "moodleName", {value:this.users[i].moodleName});
      this.result.push(result)
      console.log(this.result)
    }
    this.isResult = true;
  }
  userReport(name, id){
    let dialogRef = this.dialog.open(DisplayUsersDialogComponent, {
      width: '1500px',
      height: '800px'
      data: {
        nome: name,
        curso: 'Curso'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed: ${result}');
      this.dialogResult = result
    })
  }
}