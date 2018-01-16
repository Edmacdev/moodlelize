import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs/Rx';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DisplayUsersDialogComponent } from '../display-users-dialog/display-users-dialog.component';
import * as Fuse from 'fuse.js';

declare var $:any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  moodles: [
    {
      url: string,
      name: string,
      token: string
    }
  ]
  isCoursesResult: boolean = false;
  isUsersResult: boolean = false;

  courses: object[] = [];
  result: object[] = [];
  users: object[] = [];

  moodleIndex: number;

  form_query: string ="";
  form_field: string ="";
  form_moodle: string ="";

  constructor(
    private authService: AuthService,
    private moodleApiService: MoodleApiService,
    public dialog: MatDialog
  ){}

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
  onSubmit(query, field, moodleIndex){

    this.moodleIndex = moodleIndex;
    this.isEmpty = false;
    var params;

    switch(field){
      case 'users':

        this.isCoursesResult = false;

        var criteriakey = '';
        var criteriavalue = '';

        if(query.indexOf('@') !== -1 ){
          criteriakey = 'email';
          criteriavalue = query;
          console.log('email');
        }
        else if(query.match(/^[0-9]*$/gm)){
          criteriakey = 'id';
          criteriavalue = query;
          console.log('id')
        }
        else {
          criteriakey = 'firstname';
          criteriavalue = query + '%';
          console.log('firstname')
        }
        params ={
          wstoken: this.moodles[moodleIndex].token,
          criteriakey: criteriakey,
          criteriavalue: criteriavalue
        }
        this.moodleApiService.core_user_get_users(this.moodles[moodleIndex].url, params)
        .subscribe(
          data =>{
            this.users = data;
          },
          err => {
            console.log(err)
            return false
          },
          () => {
            if(this.users.users.length == 0){
              this.isEmpty = true;
            }
          }
        )
        this.isUsersResult = true;
      break;

      case 'courses':
        this.isUsersResult = false;
        if(!this.courses[moodleIndex]){

          params = {
            wstoken: this.moodles[moodleIndex].token
          }

          this.moodleApiService.core_course_get_courses(this.moodles[moodleIndex].url, params)
          .subscribe(
            data => {
              this.courses.splice(moodleIndex, 0, data);
            },
            err => {},
            () => {
              if(query == ''){
                this.result[moodleIndex] = this.courses[moodleIndex];

              }
              else{
                var options = {
                  shouldSort: true,
                  threshold: 0.3,
                  keys: [
                    "fullname"
                  ]
                };
                let fuse = new Fuse(this.courses[moodleIndex], options);
                this.result[moodleIndex] = fuse.search(query);

                if(this.result[moodleIndex].length == 0){
                  this.isEmpty = true;
                }
              }
            }
          )
          this.isCoursesResult = true;
        }
        else {
          if(query == ''){
            this.result[moodleIndex] = this.courses[moodleIndex];
          }
          else{
            var options = {
              shouldSort: true,
              threshold: 0.3,
              keys: [
                "fullname"
              ]
            };
            let fuse = new Fuse(this.courses[moodleIndex], options);
            this.result[moodleIndex] = fuse.search(query);
            this.isCoursesResult = true;

            if(this.result[moodleIndex].length == 0){
              this.isEmpty = true;
            }
          }
        }
      break
      default:
        alert('Escolha um campo de pesquisa');
      break
    }
  }
  userReport(name, id){
    var resultG: object[] = [];
    var resultC;
    let params = {
      wstoken: this.moodles[this.moodleIndex].token,
      userid: id
    }

    this.moodleApiService.gradereport_overview_get_course_grades(this.moodles[this.moodleIndex].url, params).subscribe(
      data => { resultG = data; console.log(data)},
      err => {console.log(err); return false},
      () => {
        if (resultG.grades.length !== 0){
          var courseids = function() {
            let courseidsString = '';
            for (let i in resultG.grades){
              courseidsString += '&options[ids][' + [i] + ']=' + resultG.grades[i].courseid ;
            }
            return courseidsString
          }

          let params = {
            wstoken: this.moodles[this.moodleIndex].token,
            coursesid: courseids()
          }

          this.moodleApiService.core_course_get_courses(this.moodles[this.moodleIndex].url, params).subscribe(
            data => { resultC = data; },
            err => {},
            () => {
              let dialogRef = this.dialog.open(DisplayUsersDialogComponent, {
                width: '1500px',
                height: '800px',
                data: {
                  name: name,
                  grades: resultG.grades,
                  courses: resultC

                }
              })
              dialogRef.afterClosed().subscribe(result => {

                this.dialogResult = result
              })
            }
          )
        }
        else {
          let dialogRef = this.dialog.open(DisplayUsersDialogComponent,{
            width: '1500px',
            height: '800px',
            data: {
              name: name,
              grades: resultG.grades,
              courses: resultC
            }
          })
        };
      }
    );
  }
}
