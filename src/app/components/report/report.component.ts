import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MoodleService } from '../../services/moodle.service';
import { MoodleApiService } from '../../services/moodle-api.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {MatTableDataSource, MatSort, MatPaginator} from '@angular/material';

import Chart from 'chart.js'
import * as $ from 'jquery';

declare var Chart: any
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  user: any;
  enrolledUsers: any[];
  usersGrades: any[];
  moodles: any[];
  courses: any[];
  course: any;
//FORMS
  form_moodle: any;
  form_courseid: number;
//TIMER
  timer: any;
//STATUS
  status: boolean[];
  isReady: boolean = false;
  isLoading: boolean = false;
  isCourseSelected: boolean = false;
  statusObs: Subject<any>;
//DATA TABLES
  displayColumns = ['position', 'name', 'email','phone','lastaccess', 'progress', 'grade'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(
    private authService: AuthService,
    private moodleService: MoodleService,
    private moodleApiService: MoodleApiService,
    private flashMessage: FlashMessagesService
  ) { }

  ngOnInit() {
    this.authService.getUser().subscribe(
      user => {
        if(user){
          this.user = user;
          this.moodleService.getMoodles(this.user.uid).subscribe(
            moodles => {
              this.moodles = moodles;
              this.form_moodle = this.moodles[0].id
            }
          )
        }
      }
    )
  }
  getCourses(){
    const params = {
      wstoken: this.form_moodle.token,
      coursesid: ''
    }
    this.moodleApiService.core_course_get_courses(this.form_moodle.url, params).subscribe(
      data => {
        if(data.errorcode){
          this.flashMessage.show(data.message,{cssClass: 'alert-danger', timeout:3000})
          return false;
        }
        this.courses = data.sort((a,b) => a.fullname.localeCompare(b.fullname))
      }
    )
  }
  report(courseIndex){
    this.status = [false, false];
    this.isReady = false;
    this.isLoading = true;
    this.statusObs = new Subject();
    this.course = this.courses[courseIndex];
    this.isCourseSelected = true;

    clearInterval(this.timer)
    //open countdown timer
    this.countdownTimer(this.course)
    //get info about enrolled users
    this.getEnrolledUsers(this.course.id).subscribe(
      data => {
        if(data.errorcode){
          this.flashMessage.show(data.message,{cssClass: 'alert-danger', timeout:3000})
          return false;
        }
        this.enrolledUsers = data.sort((a,b) => a.fullname.localeCompare(b.fullname));
        this.statusObs.next('enrolledUsers');
      }
    );
    this.getUsersGrades(this.course.id).subscribe(
      data => {
        if(data.errorcode){
          this.flashMessage.show(data.message,{cssClass: 'alert-danger', timeout:3000})
          return false;
        }
        this.usersGrades = data.usergrades.sort((a,b) => a.userfullname.localeCompare(b.userfullname));
        this.statusObs.next('usersGrades');
      }
    )
    this.statusObs.subscribe(
      data => {
        switch(data){
          case 'enrolledUsers':
            this.status[0] = true;
          break;
          case 'usersGrades':
            this.status[1] = true;
          break;
        }
        if( this.status.every(status => status === true) ){
          console.log(this.usersGrades )
          this.dataSource = new MatTableDataSource(this.prepareDataSource(this.enrolledUsers, this.usersGrades));
          this.isReady = true;
          this.isLoading = false;
          setTimeout(
            () => {
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            },400
          )
        }
        else {
          this.isReady = false;
        }
      }
    );
  }
  countdownTimer(course){
        // Update the count down every 1 second
    this.timer = setInterval(function() {

      // Get todays date and time
      var now = new Date().getTime();

      // Find the distance between now an the count down date
      var countDownDate = course.enddate *1000;
      var distance = countDownDate - now;

      if(distance > 0){
        $(".course-end").html("");
        $(".countdown").show()

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        // document.getElementById("days").innerHTML = '59';
        $(".days").html(days);
        $(".hours").html(hours);
        $(".minutes").html(minutes);
        $(".seconds").html(seconds);
      }

      // If the count down is finished, write some text
      if (distance < 0) {
        clearInterval(this.timer);
        $(".course-end").html("<h3>CURSO ENCERRADO</h3>");
        $(".countdown").hide();
      }
    }, 1000);
  }
  getEnrolledUsers(courseid){
    const params ={
      wstoken: this.form_moodle.token,
      courseid: courseid
    }
    return this.moodleApiService.core_enrol_get_enrolled_users(this.form_moodle.url, params)
  }
  getUsersGrades(courseid){
    const params ={
      wstoken: this.form_moodle.token,
      courseid: courseid
    }
    return this.moodleApiService.gradereport_user_get_grade_items(this.form_moodle.url, params)
  }
  getDaysSinceLastAccess(lastaccess){
    if(lastaccess == 0){
      return null
    }
      lastaccess = new Date(lastaccess *1000);

      let currentdate = new Date();
      let timeDiff = Math.abs(currentdate.getTime() - lastaccess.getTime());
      let diffDays = Math.floor(timeDiff / (1000 * 3600));
      return diffDays ;
  }
  hoursToDays(hours){
    if(hours >= 24) {
      let days = Math.floor(hours/24)
      if(days == 1){
        return days + ' dia';
      }
      else if(days > 1){
        return days + ' dias'
      }
    }
    else {
      if(hours == 1){
        return hours + ' hora';
      }
      else if (hours > 1){
        return hours + ' horas';
      }
      else if (hours < 1){
        return 'menos de 1 hora'
      }
    }
  }
  chartRender(index){
    var data1:number = 0;
    var data2:number = 0;
    var data3:number = 0;
    var data4:number = 0;
    var data5:number = 0;
    var data6:number = 0;
    switch (index){
      case 1:
        data1 = this.dataSource.data.filter(elem => elem.lastaccess == null).length;
        data2 = this.dataSource.data.filter(elem => elem.lastaccess < 24).length;
        data3 = this.dataSource.data.filter(elem => elem.lastaccess >= 24 && elem.lastaccess < 48 ).length;
        data4 = this.dataSource.data.filter(elem => elem.lastaccess >= 48 && elem.lastaccess < 120 ).length;
        data5 = this.dataSource.data.filter(elem => elem.lastaccess >= 120 && elem.lastaccess < 240 ).length;
        data6 = this.dataSource.data.filter(elem => elem.lastaccess > 240).length;
        var filter_access =  elem =>  elem.lastaccess = this;
        var doughnut = $("#cht-access")[0].getContext('2d');
        var doughnutChart = new Chart(doughnut, {
        type: 'doughnut',
        data: {
            labels: ["nunca", "menos de 24h", "1-2 dias", "3-5 dias", "5-10 dias", "mais de 10 dias"],
            datasets: [{
                label: '# of Votes',
                data: [data1, data2, data3, data4, data5, data6],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(218, 135, 76, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(128, 0, 128, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(218, 135, 76, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(128, 0, 128, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
        }
        })
      break;

      case 2:
        data1 = this.dataSource.data.filter(elem => elem.progress == 0).length;
        data2 = this.dataSource.data.filter(elem => elem.progress >= 1 && elem.progress <= 20).length;
        data3 = this.dataSource.data.filter(elem => elem.progress >= 21 && elem.progress <= 40).length;
        data4 = this.dataSource.data.filter(elem => elem.progress >= 41 && elem.progress <= 60).length;
        data5 = this.dataSource.data.filter(elem => elem.progress >= 61 && elem.progress <= 80).length;
        data6 = this.dataSource.data.filter(elem => elem.progress >= 81 && elem.progress <= 100).length;
        let chtProgressCtx = $("#cht-progress")[0].getContext('2d');
        let chtProgress = new Chart(chtProgressCtx, {
        type: 'bar',
        data: {
            labels: ['sem progresso', '1-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
            datasets: [{
                data: [data1, data2, data3, data4, data5, data6],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(218, 135, 76, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(128, 0, 128, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(218, 135, 76, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(128, 0, 128, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {}
        })
      break;

      case 3:
        data1 = this.dataSource.data.filter(elem => elem.grade == -1).length;
        data2 = this.dataSource.data.filter(elem => elem.grade >= 1 && elem.grade <= 20).length;
        data3 = this.dataSource.data.filter(elem => elem.grade >= 21 && elem.grade <= 40).length;
        data4 = this.dataSource.data.filter(elem => elem.grade >= 41 && elem.grade <= 60).length;
        data5 = this.dataSource.data.filter(elem => elem.grade >= 61 && elem.grade <= 80).length;
        data6 = this.dataSource.data.filter(elem => elem.grade >= 81 && elem.grade <= 100).length;
        let chtGradesCtx = $("#cht-grades")[0].getContext('2d');
        let chtGrades = new Chart(chtGradesCtx, {
        type: 'pie',
        data: {
            labels: ["sem nota","0-20", "21-40","41-60", "61-80", "81-100"],
            datasets: [{
                label: '',
                data: [data1, data2, data3, data4, data5, data6],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(218, 135, 76, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(128, 0, 128, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(218, 135, 76, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(128, 0, 128, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {}
        })
      break;
    }
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
  prepareDataSource(enrolledUsers, usersGrades){
      let dataSource:any[] = [];

      for (let i in enrolledUsers){
        if(enrolledUsers[i].roles[0].roleid == 5){
          let uid = enrolledUsers[i].id;
          let position = i;
          let name = enrolledUsers[i].fullname;
          let email = enrolledUsers[i].email;
          let phone = enrolledUsers[i].phone1;

          //last access
          let lastaccess = this.getDaysSinceLastAccess(enrolledUsers[i].lastaccess);
          // if(days == null){
          //   lastaccess = 'nunca'
          // }
          // else if (days == 0){
          //   lastaccess = 'menos de 24h'
          // }
          // else if(days >= 1 && days <= 2){
          //   lastaccess = '1-2 dias'
          // }
          // else if(days >= 3 && days <= 5){
          //   lastaccess = '3-5 dias'
          // }
          // else if(days >= 5 && days <= 10){
          //   lastaccess = '5-10 dias'
          // }
          // else if(days > 10 ){
          //   lastaccess = '10+ dias'
          // }

          let progress = 0;
          //Progress
            let activities = usersGrades[0].gradeitems.length-1;
            let gradeitems =usersGrades.find((element)=>{return element.userid == uid}).gradeitems

            for (let j = 0; j < activities; j++){
              if(gradeitems[j].graderaw)
                progress++
            }
            progress = (progress / activities) *100;

          //grade
          let grade = gradeitems[gradeitems.length - 1].graderaw;
          if(!grade) grade = -1;
          let elem: object = {
            position: position,
            name: name,
            email: email,
            phone: phone,
            lastaccess: lastaccess,
            progress: progress,
            grade: grade
          }
          dataSource.push(elem);
        }
      }
      console.log(dataSource)
      return dataSource
  }
}
export interface Element {
  name: string;
  email: string;
  phone: string;
  position: number;
  access: string;
  progress: number;
  grade: number;
}
