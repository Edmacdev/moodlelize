import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DisplayUsersDialogComponent } from '../display-users-dialog/display-users-dialog.component';
import { AuthService } from '../../services/auth.service';
import { MoodleService } from '../../services/moodle.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import * as Fuse from 'fuse.js';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  user: any;
  moodles: any;
  isCoursesResult: boolean = false;
  isUsersResult: boolean = false;
  isEmpty: boolean;
  courses: object[] = [];
  result: object[] = [];
  users: object[] = [];

  currentMoodle: any;

  form_query: string ="";
  form_field: string;
  form_moodle: object;

  constructor(
    private moodleApiService: MoodleApiService,
    public dialog: MatDialog,
    private authService: AuthService,
    private moodleService: MoodleService,
    private flashMessage: FlashMessagesService,
    private router: Router
  ){}

  ngOnInit() {
    this.authService.getUser().subscribe(
      user => {
        if(user){
          this.user = user;
          this.moodleService.getMoodles(this.user.uid).subscribe(
            moodles => {
              this.moodles = moodles;
            }
          )
        }
      }
    )
  }
  onSubmit(query, field, moodle){
    if(field && moodle ){
      this.isEmpty = false;
      this.currentMoodle = moodle;
      var isError = false;
      var params: object;

      switch(field){
        case 'users':
          this.isCoursesResult = false;
          var criteriakey: string = '';
          var criteriavalue: string = '';
          var extra: string = '';

          if(query.indexOf('@') !== -1 ){
            criteriakey = 'email';
            criteriavalue = query;
          }
          else if(query.match(/^[0-9]*$/gm)){
            criteriakey = 'id';
            criteriavalue = query;
          }
          else {
            let value: string[] = query.split(' ');

            if(value.length > 1){
              criteriakey = 'firstname';
              criteriavalue = value[0] + '%';
              extra =
              '&criteria[1][key]=lastname' +
              '&criteria[1][value]=' + '%' + query.split(value[0]).pop() + '%';
            }
            else{
              criteriakey = 'firstname';
              criteriavalue = query + '%';
            }
          }

          params ={
            wstoken: moodle.token,
            criteriakey: criteriakey,
            criteriavalue: criteriavalue,
            extra: extra
          }

          this.moodleApiService.core_user_get_users(moodle.url, params)
          .subscribe(
            data =>{
              if(data.errorcode){
                this.flashMessage.show(data.message,{cssClass: 'alert-danger', timeout:3000})
                isError = true;
              }
              else this.users = data.users;
            },
            err => {
              if(err.status == 0){
                this.flashMessage.show('Endereço do moodle não encontrado',{cssClass: 'alert-danger', timeout:3000})
              }
              return false;
            },
            () => {
              if(this.users.length == 0 && !isError){
                this.isEmpty = true;
              }
              else this.isUsersResult = true;
            }
          )
        break;
        case 'courses':
          this.isUsersResult = false;
          params = {
            wstoken: moodle.token
          }
          this.moodleApiService.core_course_get_courses(moodle.url, params).subscribe(
            data => {
              if(data.errorcode){
                this.flashMessage.show(data.message,{cssClass: 'alert-danger', timeout:3000})
                return false;
              }
              this.courses = data
            },
            err => {
              if(err.status == 0){
                this.flashMessage.show('Endereço do moodle não encontrado',{cssClass: 'alert-danger', timeout:3000})
                return false
              }
              return false;
            },
            () => {
              if(query == ''){
                this.result = this.courses;
                this.isCoursesResult = true;
              }
              else{
                var options = {
                  shouldSort: true,
                  threshold: 0.3,
                  keys: [
                    "fullname"
                  ]
                };
                let fuse = new Fuse(this.courses, options);
                this.result = fuse.search(query);
                if(this.result.length == 0){
                  this.isEmpty = true;
                }
                else this.isCoursesResult = true;
              }
            }
          )
        break
        default:
          alert('Escolha um campo de pesquisa');
        break
      }
    }
    else{
      alert("Preencha todos os campos de pesquisa")
    }
  }
  userReport(name, id){
    var resultG: any[] = [];
    var resultC: any[] = [];
    let params = {
      wstoken: this.currentMoodle.token,
      userid: id
    }
    this.moodleApiService.gradereport_overview_get_course_grades(this.currentMoodle.url, params).subscribe(
      data => { resultG = data.grades; console.log(resultG)},
      err => {console.log(err); return false},
      () => {
        if (resultG.length !== 0){
          // var courseids = function() {
          //   let courseidsString = '';
          //   for (let i in resultG){
          //     courseidsString += '&options[ids][' + [i] + ']=' + resultG[i].courseid ;
          //   }
          //   return courseidsString
          // }

          let params = {
            wstoken: this.currentMoodle.token,
            // coursesid: courseids()
          }

          this.moodleApiService.core_course_get_courses(this.currentMoodle.url, params).subscribe(
            data => { resultC = data; },
            err => {},
            () => {
              let dialogRef = this.dialog.open(DisplayUsersDialogComponent, {
                width: '1500px',
                height: '800px',
                data: {
                  name: name,
                  grades: resultG,
                  courses: resultC
                }
              })

              dialogRef.afterClosed().subscribe(result => {

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
              grades: resultG,
              courses: resultC
            }
          });
        };
      }
    )
  }
  goToCoursePage(courseid){
    this.router.navigate(['curso/' + courseid]);
  }
}
