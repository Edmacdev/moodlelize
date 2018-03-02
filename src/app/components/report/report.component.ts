import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MoodleService } from '../../services/moodle.service';
import { MoodleApiService } from '../../services/moodle-api.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import Chart from 'chart.js'
import * as $ from 'jquery';
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  user: any;
  usersAccessData: any[];
  enrolledUsers: any[];
  moodles: any[];
  courses: any[];
  course: any;
  events = [];

  form_moodle: any;
  form_courseid: string;

  courseSelected: number;
  isCourseSelected: boolean = false;

  displayedColumns = ['position', 'name', 'weight', 'symbol'];

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
  getCourse(index){
    this.course = this.courses[index];
    console.log(this.course)
    this.isCourseSelected = true;
    this.getEnrolledUsers(this.course.id);
  }
  dateConverter(utc){
    return utc = new Date(this.course.startdate*1000);
  }
  getEnrolledUsers(courseid){
    const params ={
      wstoken: this.form_moodle.token,
      courseid: courseid
    }
    this.moodleApiService.core_enrol_get_enrolled_users(this.form_moodle.url, params).subscribe(
      data => {
        if(data.errorcode){
          this.flashMessage.show(data.message,{cssClass: 'alert-danger', timeout:3000})
          return false;
        }
        this.enrolledUsers = data;
        this.usersAccessData = this.getEnrolledUsersAccessData();
        this.chartInit();
      }
    )
  }
  getDaysDiff(lastaccess){
    if(lastaccess == 0){
      return 0
    }
      lastaccess = new Date(lastaccess *1000);
      console.log('lastacces: ' + lastaccess)
      let currentdate = new Date();
      let timeDiff = Math.abs(currentdate.getTime() - lastaccess.getTime());
      let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return diffDays;
  }
  getEnrolledUsersAccessData(){
    let accessData = [];
    let never = [];
    let group1 = [];
    let group2 = [];
    let group3 = [];
    let group4 = [];
    console.log(this.enrolledUsers)
    for (let i in this.enrolledUsers){
      let days = this.getDaysDiff(this.enrolledUsers[i].lastaccess);
      if(days == 0){
        never.push(this.enrolledUsers[i])
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
    accessData.push(never, group1, group2, group3, group4);
    return accessData
  }
  getCourseDuration(){
    let startdate = new Date(this.course.startdate)
    let enddate = new Date(this.course.enddate)
    let timeDiff = Math.abs(enddate.getTime() - startdate.getTime());
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return ((diffDays <= 1)? 'indeterminado' : diffDays + ' dias')
    // console.log(this.course)
    // return 'getduration'
  }
  chartInit(){
    let doughnut = $("#doughnut")[0].getContext('2d');
    let doughnutChart = new Chart(doughnut, {
    type: 'doughnut',
    data: {
        labels: ["nunca", "1-2 dias", "3-5 dias", "5-10", "mais de 10 dias"],
        datasets: [{
            label: '# of Votes',
            data: [this.usersAccessData[0].length, this.usersAccessData[1].length,
            this.usersAccessData[2].length, this.usersAccessData[3].length, this.usersAccessData[4].length],
            // data: [1, 6, 9, 5]
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(128, 0, 128, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(128, 0, 128, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
    }
    });

    // let bar = $("#bar")[0].getContext('2d');
    // let barChart = new Chart(bar, {
    // type: 'bar',
    // data: {
    //     labels: ["nunca", "1-3 dias", "4-6 dias", "mais de 6 dias"],
    //     datasets: [{
    //         label: '# of Votes',
    //         data: [12, 39, 23, 26],
    //         backgroundColor: [
    //             'rgba(255, 99, 132, 0.2)',
    //             'rgba(54, 162, 235, 0.2)',
    //             'rgba(255, 206, 86, 0.2)',
    //             'rgba(75, 192, 192, 0.2)'
    //         ],
    //         borderColor: [
    //             'rgba(255,99,132,1)',
    //             'rgba(54, 162, 235, 1)',
    //             'rgba(255, 206, 86, 1)',
    //             'rgba(75, 192, 192, 1)'
    //         ],
    //         borderWidth: 1
    //     }]
    // },
    // options: {
    // }
    // });
    //
    // let line  = $("#line")[0].getContext('2d')
    // let lineChart = new Chart(line, {
    // type: 'line',
    // data: {
    //     labels:['3', '7', '9', '10', '15'],
    //     datasets: [{
    //         label: '# of Votes',
    //         data: [
    //           {x: 3, y: 8},
    //           {x: 7, y: 11},
    //           {x: 9, y: 12},
    //           {x: 10, y: 8},
    //           {x: 15, y: 14},
    //           {x: 18, y: 13},
    //           {x: 25, y: 17}
    //         ],
    //         borderColor: [
    //             'rgba(54, 162, 235, 1)'
    //         ],
    //         borderWidth: 1,
    //         fill: false
    //     }]
    // },
    // options: {
    //   elements: {
    //         line: {
    //             tension: 0, // disables bezier curves
    //         }
    //     }
    // }
    // });
  }
}
