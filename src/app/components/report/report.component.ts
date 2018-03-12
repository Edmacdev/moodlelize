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
  usersAccessData: any[];
  enrolledUsers: any[];
  usersGrades: any[];
  usergrades: any[];
  usersProgress: any[];
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
  displayColumns = ['position', 'name', 'email','phone','access', 'progress', 'grade'];
  dataSource: MatTableDataSource<object>;


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
    this.status = [false, false, false, false];
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
        this.usersAccessData = this.getEnrolledUsersAccessData();
      }
    );
    this.getUserGrades(this.course.id).subscribe(
      data => {
        if(data.errorcode){
          this.flashMessage.show(data.message,{cssClass: 'alert-danger', timeout:3000})
          return false;
        }
        let usersGrades = data.usergrades.sort((a,b) => a.userfullname.localeCompare(b.userfullname));
        this.usersGrades = this.courseGrades(usersGrades);
        this.usersProgress = this.courseProgress(usersGrades);
        this.usergrades = data.usergrades
        this.statusObs.next('usergrades')
        // this.reportTable(data.usergrades)
      }
    )
    this.statusObs.subscribe(
      data => {
        switch (data){
          case 'access':
            this.status[0] = true;
          break
          case 'grades':
            this.status[1] = true;
          break
          case 'progress':
            this.status[2] = true;
          break
          case 'usergrades':
            this.status[3] = true;
          break
          default:
           console.error(data)
          break
        }
        if( this.status.every(status => status === true) ){

          this.dataSource = new MatTableDataSource(this.prepareDataSource(this.enrolledUsers, this.usergrades));
          this.isReady = true;
          this.isLoading = false;
          setTimeout(
            () => {
              this.chartRender(0)
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;

            },200
          )
        }
        else {
          this.isReady = false;

        }
      }
    )
  }
  getEnrolledUsers(courseid){
    const params ={
      wstoken: this.form_moodle.token,
      courseid: courseid
    }
    return this.moodleApiService.core_enrol_get_enrolled_users(this.form_moodle.url, params)
  }
  getDaysSinceLastAccess(lastaccess){
    if(lastaccess == 0){
      return null
    }
      lastaccess = new Date(lastaccess *1000);

      let currentdate = new Date();
      let timeDiff = Math.abs(currentdate.getTime() - lastaccess.getTime());
      let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return diffDays - 1;
  }
  getEnrolledUsersAccessData(){
    let accessData = [];
    let never = [];
    let group0 = [];
    let group1 = [];
    let group2 = [];
    let group3 = [];
    let group4 = [];

    for (let i in this.enrolledUsers){
      let days = this.getDaysSinceLastAccess(this.enrolledUsers[i].lastaccess);
      if(days == null){
        never.push(this.enrolledUsers[i])
      }
      else if (days == 0){
        group0.push(this.enrolledUsers[i])
      }
      else if(days >= 1 && days <= 2){
        group1.push(this.enrolledUsers[i])
      }
      else if(days >= 3 && days <= 5){
        group2.push(this.enrolledUsers[i])
      }
      else if(days >= 5 && days <= 10){
        group3.push(this.enrolledUsers[i])
      }
      else if(days > 10 ){
        group4.push(this.enrolledUsers[i])
      }
    }
    accessData.push(never, group0, group1, group2, group3, group4);
    this.statusObs.next('access');
    return accessData
  }
  getUserGrades(courseid){
    const params ={
      wstoken: this.form_moodle.token,
      courseid: courseid
    }
    return this.moodleApiService.gradereport_user_get_grade_items(this.form_moodle.url, params)
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
  chartRender(index){
    var data1:number = 0;
    var data2:number = 0;
    var data3:number = 0;
    var data4:number = 0;
    var data5:number = 0;
    var data6:number = 0;
    switch (index){
      case 0:
        data1 = this.dataSource.data.filter(elem => elem.lastaccess == "nunca").length;
        data2 = this.dataSource.data.filter(elem => elem.lastaccess == "menos de 24h").length;
        data3 = this.dataSource.data.filter(elem => elem.lastaccess == "1-2 dias").length;
        data4 = this.dataSource.data.filter(elem => elem.lastaccess == "3-5 dias").length;
        data5 = this.dataSource.data.filter(elem => elem.lastaccess == "5-10 dias").length;
        data6 = this.dataSource.data.filter(elem => elem.lastaccess == "mais de 10 dias").length;
        var filter_access =  elem =>  elem.lastaccess = this;
        var doughnut = $("#cht-access")[0].getContext('2d');
        var doughnutChart = new Chart(doughnut, {
        type: 'doughnut',
        data: {
            labels: ["nunca", "menos de 24h", "1-2 dias", "3-5 dias", "5-10 dias", "mais de 10 dias"],
            datasets: [{
                label: '# of Votes',
                data: [data1, data2, data3, data4, data5, data6]
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

      case 1:
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

      case 2:
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
  courseProgress(usersGrades){
    let progressData = [];
    let none = [];
    let group0 = [];
    let group1 = [];
    let group2 = [];
    let group3 = [];
    let group4 = [];

    let activities = usersGrades[0].gradeitems.length-1;
    var progress = 0;

    for (let i in usersGrades){
      for(let j = 0; j< activities; j++){
        let grade = usersGrades[i].gradeitems[j].graderaw;
        if(grade){
          progress++
        }
      }
      var percentage = (progress / activities) *100;
      if(percentage == 0){
        none.push(usersGrades[i])
      }
      else if (percentage >= 1 && percentage <= 20){
        group0.push(usersGrades[i])
      }
      else if(percentage >= 21 && percentage <= 40){
        group1.push(usersGrades[i])
      }
      else if(percentage >= 41 && percentage <= 60){
        group2.push(usersGrades[i])
      }
      else if(percentage >= 61 && percentage <= 80){
        group3.push(usersGrades[i])
      }
      else if(percentage > 80){
        group4.push(usersGrades[i])
      }
    }
    progressData.push(none, group0, group1, group2, group3, group4);

    this.statusObs.next('progress');
    return progressData
  }
  courseGrades(usersGrades){
    let gradesData = [];
    let none = [];
    let group0 = [];
    let group1 = [];
    let group2 = [];
    let group3 = [];
    let group4 = [];

    for (let i in usersGrades){
      let grade = usersGrades[i].gradeitems[usersGrades[i].gradeitems.length - 1].graderaw;
      if(grade == null){
        none.push(usersGrades[i])
      }else{
        grade = grade*10
        if (grade >= 0 && grade <= 20){
          group0.push(usersGrades[i])
        }
        else if(grade >= 21 && grade <= 40){
          group1.push(usersGrades[i])
        }
        else if(grade >= 41 && grade <= 60){
          group2.push(usersGrades[i])
        }
        else if(grade >= 61 && grade <= 80){
          group3.push(usersGrades[i])
        }
        else if(grade > 80){
          group4.push(usersGrades[i])
        }
      }
    }
    gradesData.push(none, group0, group1, group2, group3, group4);
    this.statusObs.next('grades');
    return gradesData
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    this.dataSource.filter = filterValue;
  }
  reportTable(usersGrades){
    let tableData = []
    for (let i in usersGrades){
      let name = usersGrades[i].userfullname;
      let activities = usersGrades[i].gradeitems.length-1;
      let grade = usersGrades[i].gradeitems[activities].graderaw;
      grade ? grade *= 10 : grade = 0;
      let progress = 0;
      for (let j = 0; j < activities; j++){
        if(usersGrades[i].gradeitems[j].graderaw)
          progress++
      }
      progress = (progress / activities) *100;
      let elem ={position: (i), name: name, progress: progress, grade: grade}
      tableData.push(elem)
    }

    this.dataSource = new MatTableDataSource(tableData);
    this.progressDataSource = new MatTableDataSource(tableData);
    this.statusObs.next('general');
  }
  prepareDataSource(enrolledUsers, usersGrades){

      let dataSource:object[] = [];
      let chartData:

      for (let i in enrolledUsers){
        if(enrolledUsers[i].roles[0].roleid == 5){
          let uid = enrolledUsers[i].id;
          let position = i;
          let name = enrolledUsers[i].fullname;
          let email = enrolledUsers[i].email;
          let phone = enrolledUsers[i].phone1;
          let lastaccess = null;

          //last access
          let days = this.getDaysSinceLastAccess(enrolledUsers[i].lastaccess);
          if(days == null){
            lastaccess = 'nunca'
          }
          else if (days == 0){
            lastaccess = 'menos de 24h'
          }
          else if(days >= 1 && days <= 2){
            lastaccess = '1-2 dias'
          }
          else if(days >= 3 && days <= 5){
            lastaccess = '3-5 dias'
          }
          else if(days >= 5 && days <= 10){
            lastaccess = '5-10 dias'
          }
          else if(days > 10 ){
            lastaccess = '10+ dias'
          }

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

      return dataSource
  }
}
export interface Element {
  name: string;
  position: number;
  progress: number;
  grade: number;
}
