import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DisplayUsersDialogComponent } from '../display-users-dialog/display-users-dialog.component';
import * as Fuse from 'fuse.js';
import {Observable} from 'rxjs/Rx';
import { UtilService } from '../../services/util.service';


@Component({
  selector: 'app-display-users',
  templateUrl: './display-users.component.html',
  styleUrls: ['./display-users.component.scss']
})
export class DisplayUsersComponent implements OnInit {

  users: Object[] = [];
  result: Object[] = [];
  isDoneLoading: Boolean = false;
  isResult: Boolean = false;
  dialogResult = "";
  moodles: [
    {
      url: String,
      name: String,
      token:String
    }
  ]

  constructor(
    private authService:AuthService,
    private moodleApiService:MoodleApiService,
    public dialog: MatDialog,
    private utilService: UtilService
  ) { }

  ngOnInit() {
    this.authService.getProfile().subscribe(
      profile => {
        this.moodles = profile.user.moodles;
      },
      err => {
        console.log(err);
        return false;
      },
      () => {
        const numbOfMoodles = this.moodles.length;
        var observablesArray = [];

        for(var i in this.moodles){

          let params = {
            wstoken: this.moodles[i].token,
            criteriakey: 'firstname',
            criteriavalue: 'ana%',
            moodleIndex: i,
            moodleName: this.moodles[i].name
          }

          const request = this.moodleApiService.core_user_get_users(this.moodles[i].url, params)

          observablesArray.push(request);
        }

        Observable.forkJoin(observablesArray)
        // .map(data => {console.log('data!'); return data})
        .subscribe(
          data => {

            this.users = data ;


          },
          err => {
            console.log(err);
            return false;
          },
          () => {
            this.isDoneLoading = true;
            this.utilService.updateStatus(true);
            // this.utilService.currentStatus.subscribe(status => console.log(status))
            }
        )
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

    for (let i in this.moodles){

      let arr = Object.values(this.users);
      let fuse = new Fuse(arr[i].users, options);
      let result = fuse.search(value);
      this.result.push(result);

    }

    this.isResult = true;
  }

  userReport(name, id){
    var resultG;
    var resultC;
    let params = {
      wstoken: this.moodles[0].token,
      userid: id
    }

    this.moodleApiService.gradereport_overview_get_course_grades(this.moodles[0].url, params).subscribe(
      data => { resultG = data; },
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
            wstoken: this.moodles[0].token,
            coursesid: courseids()
          }

          this.moodleApiService.core_course_get_courses(this.moodles[0].url, params).subscribe(
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
