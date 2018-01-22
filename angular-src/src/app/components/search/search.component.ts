import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DisplayUsersDialogComponent } from '../display-users-dialog/display-users-dialog.component';
import { UtilService } from '../../services/util.service';
import * as Fuse from 'fuse.js';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  user: any;

  isCoursesResult: boolean = false;
  isUsersResult: boolean = false;
  isEmpty: boolean;
  courses: any[] = [];
  result: any[] = [];
  users: object[] = [];

  moodleIndex: number;

  form_query: string ="";
  form_field: string ="users";
  form_moodle: number = 0;

  constructor(
    private moodleApiService: MoodleApiService,
    public dialog: MatDialog,
    private utilService: UtilService
  ){}

  ngOnInit() {
    this.utilService.currentUser.subscribe(
      profile => {
        this.user = profile;
      }
    )
  }
  onSubmit(query, field, moodleIndex){

    this.moodleIndex = moodleIndex;
    this.isEmpty = false;
    var params: object;

    switch(field){
      case 'users':
        this.isCoursesResult = false;
        this.users = []
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
          wstoken: this.user.moodles[moodleIndex].token,
          criteriakey: criteriakey,
          criteriavalue: criteriavalue,
          extra: extra
        }

        this.moodleApiService.core_user_get_users(this.user.moodles[moodleIndex].url, params)
        .subscribe(
          data =>{
            this.users = data.users;

          },
          err => {
            console.log(err)
            return false
          },
          () => {
            if(this.users.length == 0){
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
            wstoken: this.user.moodles[moodleIndex].token
          }

          this.moodleApiService.core_course_get_courses(this.user.moodles[moodleIndex].url, params)
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
    var resultG: any[] = [];
    var resultC: any[] = [];
    let params = {
      wstoken: this.user.moodles[this.moodleIndex].token,
      userid: id
    }

    this.moodleApiService.gradereport_overview_get_course_grades(this.user.moodles[this.moodleIndex].url, params).subscribe(
      data => { resultG = data.grades;},
      err => {console.log(err); return false},
      () => {
        if (resultG.length !== 0){
          var courseids = function() {
            let courseidsString = '';
            for (let i in resultG){
              courseidsString += '&options[ids][' + [i] + ']=' + resultG[i].courseid ;
            }
            return courseidsString
          }

          let params = {
            wstoken: this.user.moodles[this.moodleIndex].token,
            coursesid: courseids()
          }

          this.moodleApiService.core_course_get_courses(this.user.moodles[this.moodleIndex].url, params).subscribe(
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
  onChange(){
    // if (this.form_field == "courses"){
      this.onSubmit(this.form_query, this.form_field, this.form_moodle)
    // }
  }
}
