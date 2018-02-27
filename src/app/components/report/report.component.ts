import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MoodleService } from '../../services/moodle.service';
import { MoodleApiService } from '../../services/moodle-api.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import Chart from 'chart.js'
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  user: any;
  enrolledUsers: any[];
  moodles: any[];
  courses: any[];
  course: any;
  events = [];

  form_moodle: any;
  form_courseid: string;

  courseSelected: number;
  isCourseSelected: boolean = false;

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
        console.log(this.courses)
      }
    )
  }
  getCourse(index){
    this.course = this.courses[index];
    console.log(this.course)
    this.isCourseSelected = true;
    this.getEnrolledUsers(this.course.id);
    this.chartInit();
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
        console.log(this.enrolledUsers)
      }
    )
  }
  getDaysDiff(lastaccess){
    for(let i in this.enrolledUsers){
      lastaccess = new Date(lastaccess);
      let currentdate = new Date();
      let timeDiff = Math.abs(currentdate.getTime() - lastaccess.getTime());
      let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      console.log(diffDays)
    }
  }
  chartInit(){
    let doughnut: HTMLCanvasElement = document.getElementById("doughnut").getContext('2d');
    var myChart = new Chart(doughnut, {
    type: 'doughnut',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
    }
    });

    let bar: HTMLCanvasElement = document.getElementById("bar").getContext('2d');
    var myChart = new Chart(bar, {
    type: 'bar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
    }
    });

    let line: HTMLCanvasElement = document.getElementById("line").getContext('2d');
    var myChart = new Chart(line, {
    type: 'line',
    data: {
        labels['3', '7', '9', '10', '15'],
        datasets: [{
            label: '# of Votes',
            data: [
              {x: 3, y: 8},
              {x: 7, y: 11},
              {x: 9, y: 12},
              {x: 10, y: 8},
              {x: 15, y: 14},
              {x: 18, y: 13},
              {x: 25, y: 17}
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 1,
            fill: false
        }]
    },
    options: {
      elements: {
            line: {
                tension: 0, // disables bezier curves
            }
        }
    }
    });
  }
}
