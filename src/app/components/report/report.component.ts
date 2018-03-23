import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MoodleService } from '../../services/moodle.service';
import { MoodleApiService } from '../../services/moodle-api.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import {Observable} from 'rxjs/Rx'
import 'rxjs/add/operator/merge';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Subject } from 'rxjs/Subject';
import {MatTableDataSource, MatSort, MatPaginator} from '@angular/material';
import swal from 'sweetalert2';
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
  courseTitle: string;
  user_info: object;
//FORMS
  form_moodle: any;
  form_courseid: number;
//TIMER
  timer: any;
//STATUS
  status: boolean[];
  isReady: boolean = false;
  isLoading: boolean = false;
  isEnded: boolean = false;
  isCourseSelected: boolean = false;
  statusObs: Subject<any>;
  usersCourseStatus: any[] = [];
//DATA TABLES
  displayColumns = ['risk', 'name', 'email','phone','lastaccess', 'progress', 'grade'];
  displayColumnsResult = ['name', 'email','phone','result', 'grade'];
  dataSource: MatTableDataSource<any>;
//USER ELEMENT TABLE DATA
  selectedUserInfo: object;
  userElemValue: string;
//OBSERVABLES
  observableArray: any[] = []
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
              if(moodles.length > 0){
                this.moodles = moodles;
                this.form_moodle = this.moodles[0].id
              }
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
    this.isReady = false;
    this.isLoading = true;
    this.course = this.courses[courseIndex];
    this.isCourseSelected = true;
    clearInterval(this.timer)
    // open countdown timer
    this.countdownTimer(this.course)
    // //get info about enrolled users
    // this.getEnrolledUsers(this.course.id).subscribe(
    //   data => {
    //     if(data.errorcode){
    //       this.flashMessage.show(data.message,{cssClass: 'alert-danger', timeout:3000})
    //       return false;
    //     }
    //     let filter = data.filter(element =>  element.roles[0].roleid == 5);
    //     this.enrolledUsers = filter.sort((a,b) => a.fullname.localeCompare(b.fullname));
    //     this.statusObs.next('enrolledUsers');
    //   }
    // );
    // this.getUsersGrades(this.course.id).subscribe(
    //   data => {
    //     if(data.errorcode){
    //       this.flashMessage.show(data.message,{cssClass: 'alert-danger', timeout:3000})
    //       return false;
    //     }
    //     this.usersGrades = data.usergrades.sort((a,b) => a.userfullname.localeCompare(b.userfullname));
    //     var activitiesStatusArray: any[] = [];
    //     for(let i in this.usersGrades){
    //       observableArray.push(this.getUserActivitiesStatus(this.course.id, this.usersGrades[i].userid))
    //     }
    //     forkJoin(activitiesStatusArray).subscribe(
    //       result => {
    //         this.usersActivitiesStatus = result;
    //         this.statusObs.next('usersGrades');
    //       }
    //     )
    //     for(let i in this.usersGrades){
    //       observableArray.push(this.getUserActivitiesStatus(this.course.id, this.usersGrades[i].userid))
    //     }
    //   }
    // )
    // this.statusObs.subscribe(
    //   data => {
    //     switch(data){
    //       case 'enrolledUsers':
    //         this.status[0] = true;
    //       break;
    //       case 'usersGrades':
    //         this.status[1] = true;
    //       break;
    //     }
    //     if( this.status.every(status => status === true) ){
    //
    //       this.dataSource = new MatTableDataSource(this.prepareDataSource(this.enrolledUsers, this.usersGrades, this.usersActivitiesStatus));
    //       this.isReady = true;
    //       this.isLoading = false;
    //
    //       setTimeout(
    //         () => {
    //           this.dataSource.paginator = this.paginator;
    //           this.dataSource.sort = this.sort;
    //
    //           $(".input-title").focusout(
    //             (event) =>{
    //
    //               this.changeTitleHandler()
    //             }
    //           )
    //           $(".input-title").keyup(
    //             (event) =>{
    //               if(event.which == 13){
    //                 this.changeTitleHandler()
    //               }
    //             }
    //           )
    //
    //           $(".user-info").focusout(
    //             (event) => {
    //
    //               this.changeUserInfoHandler(this.selectedUserInfo, event)
    //             }
    //           )
    //           $(".user-info").keyup(
    //             (event) =>{
    //               if(event.which == 13){
    //                 this.changeUserInfoHandler(this.selectedUserInfo, event)
    //               }
    //             }
    //           )
    //       },400
    //     )
    //   }
    //     else {
    //       this.isReady = false;
    //     }
    //   }
    // );
    var wstoken: string = this.form_moodle.token;
    var url: string = this.form_moodle.url;
    var courseid: string = this.course.id
    var status: boolean[] = [false, false] ;

    var statusSubject: Subject<string> = new Subject();


    //BUSCAR USUÁRIOS MATRICULADOS
    let enrolledUsers;
    this.moodleApiService.core_enrol_get_enrolled_users(url,{wstoken: wstoken,courseid: courseid})
    .subscribe(
      data => {
        if(data.errorcode){
          this.flashMessage.show(data.message,{cssClass: 'alert-danger', timeout:3000})
          return false;
        }
        this.enrolledUsers = data.filter(element =>  element.roles[0].roleid == 5);
        this.enrolledUsers = this.enrolledUsers.sort((a,b) => a.fullname.localeCompare(b.fullname));
        statusSubject.next('enrolledUsers');
      }
    )
    //BUSCAR NOTAS DOS ALUNOS
    let usersGrades;
    var activitiesStatusArray: any[] = []
    var courseStatusArray: any[] = []

    this.moodleApiService.gradereport_user_get_grade_items(url,{wstoken: wstoken,courseid: courseid})
    .subscribe(
      data => {

        if(data.errorcode){
          this.flashMessage.show(data.message,{cssClass: 'alert-danger', timeout:3000})
          return false;
        }
        usersGrades= data.usergrades.sort((a,b) => a.userfullname.localeCompare(b.userfullname));
        console.log(this.isEnded)
        if(!this.isEnded){
          //BUSCAR ATIVIDADES FEITAS POR ALUNOS
          let activitiesStatusRequestArray: any[] =[]
          for(let i in usersGrades){
            let userid = usersGrades[i].userid
            let request = this.moodleApiService.core_completion_get_activities_completion_status(url,{wstoken: wstoken,courseid: courseid, userid: userid});
            activitiesStatusArray.push(request);
          }
          forkJoin(activitiesStatusArray).subscribe(
            result => {
              activitiesStatusArray = result;
              statusSubject.next('usersActivitiesCompletion');
            }
          )
        }
        else{
          //VERIFICAR SE USUÁRIO CONCLUIU O CURSO
          let courseStatusRequestArray: any[] =[]
          for(let i in usersGrades){
            let userid = usersGrades[i].userid
            let request = this.moodleApiService.core_completion_get_course_completion_status(url,{wstoken: wstoken,courseid: courseid, userid: userid})
            courseStatusArray.push(request)
          }
          forkJoin(courseStatusArray).subscribe(
            result => {
              courseStatusArray = result;
              statusSubject.next('usersCourseCompletion');

            }
          )
        }
      }
    )
    statusSubject.subscribe(
      data => {
        switch(data){
          case 'enrolledUsers':
            status[0] = true;
          break
          case 'usersActivitiesCompletion':
            status[1] = true;
          break
          case 'usersCourseCompletion':
            status[1] = true;
          break
        }
        if(status.every(st => st === true)){
          this.dataSource = new MatTableDataSource(this.prepareDataSource(this.enrolledUsers, usersGrades, activitiesStatusArray, courseStatusArray));
          this.isReady = true;
          this.isLoading = false;

          setTimeout(
            () => {
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;

              $(".input-title").focusout(event => this.changeTitleHandler());
              $(".input-title").keyup(
                (event) =>{
                  if(event.which == 13){
                    this.changeTitleHandler()
                  }
                }
              )
              $(".user-info").focusout(
                (event) => {
                  this.changeUserInfoHandler(this.selectedUserInfo, event)
                }
              )
              $(".user-info").keyup(
                (event) =>{
                  if(event.which == 13){
                    this.changeUserInfoHandler(this.selectedUserInfo, event)
                  }
                }
              )
            },400
          )
        }
        else this.isReady = false;
      }
    )
  }
  countdownTimer(course){
    let now = new Date().getTime();
    if((course.enddate*1000 - now)<0) this.isEnded = true;
        // Update the count down every 1 second
    this.timer = setInterval(() =>{

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
        this.isEnded = true;

      }
      else     this.isEnded = false;
    }, 1000);

  }
  courseTime(course){
    let now = new Date().getTime();
    let enddate = course.enddate *1000;
    let startdate = course.startdate *1000;
    let distance = now - startdate;
    let duration = enddate - startdate;
    let progress = Math.floor((distance *100) / duration)
    let courseTime = {
      duration: duration,
      progress: progress
    }
    return courseTime

  }
  getEnrolledUsers(token, courseid){
    const params ={
      wstoken: token,
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
  getUserActivitiesStatus(courseid, userid){
    const params ={
      wstoken: this.form_moodle.token,
      courseid: courseid,
      userid: userid
    }
    return this.moodleApiService.core_completion_get_activities_completion_status(this.form_moodle.url, params)
  }
  getUsersCourseStatus(courseid, userid){
    const params ={
      wstoken: this.form_moodle.token,
      courseid: courseid,
      userid: userid
    }
    return this.moodleApiService.core_completion_get_course_completion_status(this.form_moodle.url, params)
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
      return 'menos de 1 dia'
      // if(hours == 1){
      //   return hours + ' hora';
      // }
      // else if (hours > 1){
      //   return hours + ' horas';
      // }
      // else if (hours < 1){
      //   return 'menos de 1 hora'
      // }
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
        var days = percentage => {
          let courseDuration = Math.floor(this.courseTime(this.course).duration/(1000 * 60 * 60 * 24));
          return Math.floor((percentage*courseDuration)/100);
        }
        data1 = this.dataSource.data.filter(elem => elem.lastaccess/24 == null).length;
        data2 = this.dataSource.data.filter(elem => elem.lastaccess/24 < days(5)).length;
        data3 = this.dataSource.data.filter(elem => elem.lastaccess/24 >= days(5) && elem.lastaccess/24 < days(10) ).length;
        data4 = this.dataSource.data.filter(elem => elem.lastaccess/24 >= days(10) && elem.lastaccess/24 < days(25) ).length;
        data5 = this.dataSource.data.filter(elem => elem.lastaccess/24 >= days(25) && elem.lastaccess/24 < days(50) ).length;
        data6 = this.dataSource.data.filter(elem => elem.lastaccess/24 > days(50)).length;
        var filter_access =  elem =>  elem.lastaccess = this;
        var chtAccessCtx = $("#cht-access")[0].getContext('2d');
        var chtAccess = new Chart(chtAccessCtx, {
        type: 'bar',
        data: {
            labels: [
              "nunca",
              "menos de " + days(5) + " dias",
              days(5) + "-" + days(10) + " dias",
              days(10) + "-" + days(25) + " dias",
              days(25) + "-" + days(50) + " dias",
              "mais de " + days(50) + " dias"],
            datasets: [{
                label: '',
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
                label: '',
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
        type: 'bar',
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
  prepareDataSource(enrolledUsers, usersGrades, ActivitiesCompletion, courseCompletion){
    console.log(ActivitiesCompletion)
    console.log(courseCompletion)
      let dataSource:any[] = [];

      for (let i in enrolledUsers){
        let uid = enrolledUsers[i].id;
        let name = enrolledUsers[i].fullname;
        let firstname = enrolledUsers[i].firstname;
        let lastname = enrolledUsers[i].lastname;
        let email = enrolledUsers[i].email;
        let phone = enrolledUsers[i].phone1;

        //last access
        let lastaccess = this.getDaysSinceLastAccess(enrolledUsers[i].lastaccess);

        //grade
        let gradeitems =usersGrades.find((element)=>{return element.userid == uid}).gradeitems
        let grade = gradeitems[gradeitems.length - 1].graderaw;
        if(!grade) grade = -1;
        if(!this.isEnded){
          //Progress
            let activities = ActivitiesCompletion[i].statuses.length;
            let activitiesCompleted = 0;
            for(let j in ActivitiesCompletion[i].statuses){
              if(ActivitiesCompletion[i].statuses[j].state != 0) activitiesCompleted++
            }

            let progress = Math.floor((activitiesCompleted *100)/ activities);
            //status
            let risk: string = '';
            let courseTime = this.courseTime(this.course);
            if( progress >= courseTime.progress ) risk = 'baixo'
            else{
              if(lastaccess <= 48 ) risk = 'médio';
              else risk = 'alto'
            }
            let elem = {
              id: uid,
              name: name,
              firstname: firstname,
              lastname: lastname,
              email: email,
              phone: phone,
              lastaccess: lastaccess,
              progress: progress,
              grade: grade,
              risk: risk
            }
            dataSource.push(elem);
        }
        else{
          //Result
          let result: string
          if(courseCompletion[i].errorcode){
            switch(courseCompletion[i].errorcode){
              case 'nocriteriaset':
                result = 'Sem Critério'
              break
              case 'cannotviewreport':
                result = 'Desconhecido'
              break
              default: result = ''
            }
          }
          else {
              let courseCompletionStatus: boolean = courseCompletion[i].completionstatus.completed;
              courseCompletionStatus? result = 'Aprovado' : result = 'Reprovado'
          }

          let elem = {
            id: uid,
            name: name,
            firstname: firstname,
            lastname: lastname,
            email: email,
            phone: phone,
            grade: grade,
            result: result
          }
          dataSource.push(elem);
        }
      }
      return dataSource
  }
  changeTitle(title){
    const params ={
      wstoken: this.form_moodle.token,
      courseid: this.course.id,
      fullname: title
    }
    return this.moodleApiService.core_course_update_courses(this.form_moodle.url, params);
  }
  changeUserInfo(user, value){

    const params ={
      wstoken: this.form_moodle.token,
      userid: user.id,
      userinfo: "&users[0][" + user.type + "]=" + value
    }
    return this.moodleApiService.core_user_update_users(this.form_moodle.url, params);
  }
  changeTitleHandler(){
      if($(".input-title").val() != this.course.fullname){
        swal({
          title: 'Mudar Título',
          text: 'Tem certeza de que quer alterar o título?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim',
          cancelButtonText: 'Não'
        }).then((result) => {
          if (result.value) {
            this.changeTitle($(".input-title").val()).subscribe(
              (data) => {
                if(data.exception){
                  $(".input-title").val(this.course.fullname);
                  swal(
                    '',
                    'Erro ao atualizar o título',
                    'error'
                  )
                }
                else{
                  this.course.fullname = $(".input-title").val()
                  swal(
                    '',
                    'Título Atualizado!',
                    'success'
                  )
                }
              }
            );
          } else if (result.dismiss === swal.DismissReason.cancel) {
            $(".input-title").val(this.course.fullname);
            swal(
              '',
              'O título não foi alterado',
              'error'
            )
          }
        })
      }
  }
  changeUserInfoHandler(user, event){
    var i;
    var dataSourceUser = this.dataSource.data
      .find((element, index) => {
        i = index;
        return element.id == user.id;
      })

    if(event.target.value !=  dataSourceUser.firstname &&
       event.target.value !=  dataSourceUser.lastname &&
       event.target.value !=  dataSourceUser.email ){
      swal({
        title: 'Alterar Usuário',
        text: 'Tem certeza de que quer alterar esta informação?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
      }).then((result) => {
        if (result.value) {
          this.changeUserInfo(user, event.target.value).subscribe(
            data => {
              if(data != null){
                swal(
                  '',
                  'Erro ao atualizar usuário',
                  'error'
                )
                if(user.type == 'firstname') $("#firstname"+user.id).val(dataSourceUser.firstname);
                else if(user.type == 'lastname') $("#lastname"+user.id).val(dataSourceUser.lastname);
                else if(user.type == 'email') $("#email"+user.id).val(dataSourceUser.email);
              }
              else{
                if(user.type == 'firstname') this.dataSource.data[i].firstname = $("#firstname"+user.id).val();
                else if(user.type == 'lastname') this.dataSource.data[i].lastname = $("#lastname"+user.id).val();
                else if(user.type == 'email') this.dataSource.data[i].email = $("#email"+user.id).val();
                swal(
                  '',
                  'Usuário Atualizado!',
                  'success'
                )
              }
            }
          );
        } else if (result.dismiss === swal.DismissReason.cancel) {
          swal(
            '',
            'O usuário não foi atualizado',
            'error'
          )
          if(user.type == 'firstname') $("#firstname"+user.id).val(dataSourceUser.firstname);
          else if(user.type == 'lastname') $("#lastname"+user.id).val(dataSourceUser.lastname);
          else if(user.type == 'email') $("#email"+user.id).val(dataSourceUser.email);

        }
      })
    }
  }
  setCurrentUserInfo(id, type){
    const userInfo = {
      id: id,
      type: type
    }
    this.selectedUserInfo = userInfo;
  }
  getRowColor(condition){

    if(condition == 'baixo') return 'rgba(54, 162, 235, 0.1)';
    else if(condition == 'médio') return 'rgba(255, 206, 86, 0.1)';
    else if(condition == 'alto') return 'rgba(255, 0, 0, 0.1)';
    else if(condition == 'Aprovado') return 'rgba(54, 162, 235, 0.1)';
    else if(condition == 'Reprovado') return 'rgba(255, 0, 0, 0.1)';
    else if(condition == 'Sem Critério') return 'rgba(255, 206, 86, 0.1)';
    else if(condition == 'Desconhecido') return 'rgba(255, 206, 86, 0.1)';
  }
  formatDate(date){
    let dateFormat = new Date(date*1000)
    return dateFormat
  }
  // getUsersInfo(){
  //   var wstoken: string = this.form_moodle.token;
  //   var url: string = this.form_moodle.url;
  //   var courseid: string = this.course.id
  //   var status: boolean[] = [false, false, false] ;
  //   var statusSubject: Subject<string> = new Subject();
  //
  //
  //   //BUSCAR USUÁRIOS MATRICULADOS
  //   let enrolledUsers;
  //   this.moodleApiService.core_enrol_get_enrolled_users(url,{wstoken: token,courseid: courseid})
  //   .subscribe(
  //     data => {
  //       if(data.errorcode){
  //         this.flashMessage.show(data.message,{cssClass: 'alert-danger', timeout:3000})
  //         return false;
  //       }
  //       this.enrolledUsers = data.filter(element =>  element.roles[0].roleid == 5);
  //       this.statusObs.next('enrolledUsers');
  //     }
  //   )
  //   //BUSCAR NOTAS DOS ALUNOS
  //   let usersGrades
  //   var activitiesStatusArray: object[] = []
  //   var courseStatusArray: object[] = []
  //
  //   this.moodleApiService.gradereport_user_get_grade_items(url,{wstoken: token,courseid: courseid})
  //   .subscribe(
  //     data => {
  //       if(data.errorcode){
  //         this.flashMessage.show(data.message,{cssClass: 'alert-danger', timeout:3000})
  //         return false;
  //       }
  //       usersGrades = data.usergrades
  //       //BUSCAR ATIVIDADES FEITAS POR ALUNOS
  //       let activitiesStatusRequestArray: object[] =[]
  //       for(let i in usersGrades){
  //         let userid = usersGrades[i].userid
  //         let request = this.moodleApiService.core_completion_get_activities_completion_status(url,{wstoken: token,courseid: courseid, userid: userid});
  //         activitiesStatusArray.push(request);
  //       }
  //       forkJoin(activitiesRequestStatusArray).subscribe(
  //         result => {
  //           activitiesStatusArray = result;
  //           this.statusObs.next('usersActivitiesCompletion');
  //         }
  //       )
  //       //VERIFICAR SE USUÁRIO CONCLUIU O CURSO
  //       let courseStatusRequestArray: object[] =[]
  //       for(let i in usersGrades){
  //         let userid = usersGrades[i].userid
  //         let request = this.moodleApiService.core_completion_get_course_completion_status(url,{wstoken: token,courseid: courseid, userid: userid})
  //         courseStatusArray.psuh(request)
  //       }
  //       forkJoin(courseStatusRequestArray).subscribe(
  //         result => {
  //           courseStatusArray = result;
  //           this.statusObs.next('usersCourseCompletion');
  //         }
  //       )
  //     }
  //   )
  //   statusSubject.subscribe(
  //     data => {
  //       switch(data){
  //         case 'enrolledUsers':
  //           status[0] = true;
  //         break
  //         case 'usersActivitiesCompletion':
  //           status[1] = true;
  //         break
  //         case 'usersCourseCompletion':
  //           status[2] = true;
  //         break
  //       }
  //       if(status.every(st => st === true)){
  //         this.dataSource = new MatTableDataSource(this.prepareDataSource(this.enrolledUsers, usersGrades, usersActivitiesStatus));
  //         this.isReady = true;
  //         this.isLoading = false;
  //
  //         setTimeout(
  //           () => {
  //             this.dataSource.paginator = this.paginator;
  //             this.dataSource.sort = this.sort;
  //
  //             $(".input-title").focusout(event => this.changeTitleHandler());
  //             $(".input-title").keyup(
  //               (event) =>{
  //                 if(event.which == 13){
  //                   this.changeTitleHandler()
  //                 }
  //               }
  //             )
  //             $(".user-info").focusout(
  //               (event) => {
  //                 this.changeUserInfoHandler(this.selectedUserInfo, event)
  //               }
  //             )
  //             $(".user-info").keyup(
  //               (event) =>{
  //                 if(event.which == 13){
  //                   this.changeUserInfoHandler(this.selectedUserInfo, event)
  //                 }
  //               }
  //             )
  //           },400
  //         )
  //       }
  //       else this.isReady = false;
  //     }
  //   )
  // }
  }
export interface Element {
  name: string;
  email: string;
  phone: string;
  id: number;
  access: string;
  progress: number;
  grade: number;
}
