import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MoodleService } from '../../services/moodle.service';
import { MoodleApiService } from '../../services/moodle-api.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FlashMessagesService } from 'angular2-flash-messages';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DisplayUsersDialogComponent } from '../display-users-dialog/display-users-dialog.component';
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
  enrolledUsers: any[] = [];
  enrolledTeachers: any[] = [];
  enrolledStudents: any[] = [];
  activitiesStatusArray: any[] = []
  courseStatusArray: any[] = []
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
  usersCourseStatus: any[] = [];
//DATA TABLES
  displayColumns = ['risk', 'name', 'email','phone','lastaccess', 'progress', 'grade','options'];
  displayColumnsResult = ['name', 'email','phone','result', 'grade','options'];
  dataSource: MatTableDataSource<any>;
  dataSourcePrepared: MatTableDataSource<any>;
//USER ELEMENT TABLE DATA
  selectedUserInfo: object;
  userElemValue: string;
//OBSERVABLES
  observableArray: any[] = []
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;
//ENROLL USER TAB
  form_ctrl = new FormControl();
  fg_search_users: FormGroup;
  form_opt: number;
  form_query: string;
  options: string[] = ['id', 'nome', 'sobrenome', 'usuário', 'email'];
  usersList: any[] =[];
  selectedUsersForEnrol: any[] = [];
  selectedUsersForUnenrol: any[] = [];


  constructor(
    private authService: AuthService,
    private moodleService: MoodleService,
    private moodleApiService: MoodleApiService,
    private flashMessage: FlashMessagesService,
    public dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.fg_search_users = fb.group({
      'qry':[null, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
      'opt': [null, Validators.compose([Validators.required])]
  }) }

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
          let errortext: string;
          switch(data.errorcode){
            case 'invalidtoken':
              errortext = 'O token registrado é inválido.';
            break
            default: errortext = 'Ocorreu um erro desconhecido'
          }
          swal({
            type: 'error',
            text: errortext
          })
          return false;
        }
        this.courses = data.sort((a,b) => a.fullname.localeCompare(b.fullname))
      },
      err => {
        if(err.status == 0){
          swal({
            type: 'error',
            text: 'O URL registrado não é válido.'
          })
        }
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
    let now = new Date().getTime();
    let countdown = (this.course.enddate *1000)+86400000*1;
    if(countdown - now < 0) this.isEnded = true;
    this.countdownTimer(this.course)

    var wstoken: string = this.form_moodle.token;
    var url: string = this.form_moodle.url;
    var courseid: string = this.course.id
    // var activitiesStatusArray: any[] = []
    // var courseStatusArray: any[] = []
    var status: boolean[] = [false, false] ;
    var statusSubject: Subject<string> = new Subject();

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
          default: console.log('default: ' + data)
        }
        if(status.every(st => st === true)){
          this.dataSourcePrepared = new MatTableDataSource(this.prepareDataSource(this.enrolledStudents, this.usersGrades, this.activitiesStatusArray, this.courseStatusArray));
          this.dataSource = new MatTableDataSource(this.prepareDataSource(this.enrolledStudents, this.usersGrades, this.activitiesStatusArray, this.courseStatusArray));
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

    //BUSCAR USUÁRIOS MATRICULADOS
    let enrolledUsers;
    this.moodleApiService.core_enrol_get_enrolled_users(url,{wstoken: wstoken,courseid: courseid})
    .subscribe(
      data => {
        if(data.errorcode){
          this.flashMessage.show(data.message,{cssClass: 'alert-danger', timeout:3000})
          return false;
        }
        if(data.length > 0){

          this.enrolledUsers = data;
          this.enrolledTeachers = data.filter(element =>  element.roles[0].roleid == 3);
          this.enrolledStudents = data.filter(element =>  element.roles[0].roleid == 5);
          this.enrolledStudents = this.enrolledStudents.sort((a,b) => a.fullname.localeCompare(b.fullname));
          statusSubject.next('enrolledUsers');

          //BUSCAR NOTAS DOS ALUNOS




          this.moodleApiService.gradereport_user_get_grade_items(url,{wstoken: wstoken,courseid: courseid})
          .subscribe(
            data => {
              if(data.errorcode){
                return false;
              }
              this.usersGrades= data.usergrades.sort((a,b) => a.userfullname.localeCompare(b.userfullname));

              if(!this.isEnded){
                //BUSCAR ATIVIDADES FEITAS POR ALUNOS
                let activitiesStatusRequestArray: any[] =[]
                for(let i in this.usersGrades){
                  let userid = this.usersGrades[i].userid
                  let request = this.moodleApiService.core_completion_get_activities_completion_status(url,{wstoken: wstoken,courseid: courseid, userid: userid});
                  this.activitiesStatusArray.push(request);
                }
                forkJoin(this.activitiesStatusArray).subscribe(
                  result => {
                    this.activitiesStatusArray = result;
                    statusSubject.next('usersActivitiesCompletion');
                  }
                )
              }
              else{
                //VERIFICAR SE USUÁRIO CONCLUIU O CURSO
                let courseStatusRequestArray: any[] =[]
                for(let i in this.usersGrades){
                  let userid = this.usersGrades[i].userid
                  let request = this.moodleApiService.core_completion_get_course_completion_status(url,{wstoken: wstoken,courseid: courseid, userid: userid})
                  this.courseStatusArray.push(request)
                }
                forkJoin(this.courseStatusArray).subscribe(
                  result => {
                    this.courseStatusArray = result;
                    statusSubject.next('usersCourseCompletion');

                  }
                )
              }
            }
          )

        }
        else this.isReady = true;

    })
  }
  countdownTimer(course){

    // Update the count down every 1 second

    this.timer = setInterval(() =>{
      // Get todays date and time
      var now = new Date().getTime();
      var countDownDate = (course.enddate *1000)+86400000*1;
      var distance = countDownDate - now;
      // Find the distance between now an the count down date


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
    }
  }
  chartRender(chart){
    switch(chart){
      case 'access':
      var data1:number = 0;
      var data2:number = 0;
      var data3:number = 0;
      var data4:number = 0;
      var data5:number = 0;
      var data6:number = 0;

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

    break
    case 'progress':

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
        break
        case 'grades':
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
      break
    }
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
  prepareDataSource(enrolledStudents, usersGrades, activitiesCompletion, courseCompletion){

      let dataSource:any[] = [];

      for (let i in enrolledStudents){
        let uid = enrolledStudents[i].id;
        let name = enrolledStudents[i].fullname;
        let firstname = enrolledStudents[i].firstname;
        let lastname = enrolledStudents[i].lastname;
        let email = enrolledStudents[i].email;
        let phone = enrolledStudents[i].phone1;

        //last access
        let lastaccess = this.getDaysSinceLastAccess(enrolledStudents[i].lastaccess);

        //grade
        let gradeitems =usersGrades.find((element)=>{return element.userid == uid}).gradeitems
        let grade = gradeitems[gradeitems.length - 1].graderaw;
        if(!grade) grade = -1;
        if(!this.isEnded){
          //Progress

            let activities = activitiesCompletion[i].statuses.length;
            let activitiesCompleted = 0;
            for(let j in activitiesCompletion[i].statuses){
              if(activitiesCompletion[i].statuses[j].state != 0) activitiesCompleted++
            }

            let progress = Math.floor((activitiesCompleted *100)/ activities);
            //status
            let risk: string = '';
            let courseTime = this.courseTime(this.course);
            if( progress >= courseTime.progress ) risk = '1 - baixo'
            else{
              if(lastaccess <= 48 ) risk = '2 - médio';
              else risk = '3 - alto'
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
              risk: risk,
              icon:''
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
      if(this.isEnded) return dataSource;
      else {
        dataSource.sort((a,b) => a.risk.localeCompare(b.risk));
        return dataSource.reverse();
      }

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

    if(condition == '1 - baixo') return 'rgba(54, 162, 235, 0.1)';
    else if(condition == '2 - médio') return 'rgba(255, 206, 86, 0.1)';
    else if(condition == '3 - alto') return 'rgba(255, 0, 0, 0.1)';
    else if(condition == 'Aprovado') return 'rgba(54, 162, 235, 0.1)';
    else if(condition == 'Reprovado') return 'rgba(255, 0, 0, 0.1)';
    else if(condition == 'Sem Critério') return 'rgba(255, 206, 86, 0.1)';
    else if(condition == 'Desconhecido') return 'rgba(255, 206, 86, 0.1)';
  }
  formatDate(date){
    let dateFormat = new Date(date*1000)
    return dateFormat
  }
  print(){
    // $('#tb-users').printThis();
    window.print();
  }
  getUsers(query, fieldIndex){
    var options: string[] = ['id', 'firstname', 'lastname', 'username', 'email'];


    this.moodleApiService.core_user_get_users(this.form_moodle.url, {wstoken: this.form_moodle.token,criteriakey:options[fieldIndex],criteriavalue:query})
      .subscribe(
        data => {
          this.usersList = data.users.sort((a,b) => a.fullname.localeCompare(b.fullname));
        },
        err => console.log(err)
      )
  }
  tabChange(event){
    if(event.index == 1){
      if(this.isEnded){
        this.chartRender('grades')
      }
      else{
        this.chartRender('access')
        this.chartRender('progress')
        this.chartRender('grades')
      }
    }
  }
  checkUser(event, user){
    if(event.checked){
      this.selectedUsersForEnrol.push(user);
    }
    else{
      var i;
      this.selectedUsersForEnrol.find(
        (element, index)=>{
          i = index;
          return element.id == user.id
        })
      this.selectedUsersForEnrol.splice(i,1);
    }
  }
  enrolUsers(){
    let enrolments: string ='';
    for(let i in this.selectedUsersForEnrol){
      let enrolment =
      '&enrolments['+i+'][roleid]=5'+
      '&enrolments['+i+'][userid]='+this.selectedUsersForEnrol[i].id +
      '&enrolments['+i+'][courseid]='+this.course.id;
      enrolments += enrolment
    }

    const params ={
      wstoken: this.form_moodle.token,
      enrolments: enrolments
    }
    this.moodleApiService.enrol_manual_enrol_users(this.form_moodle.url, params).subscribe(
      data => {
        if(data == null){
          this.dataSource = new MatTableDataSource(
            this.prepareDataSource(
              this.enrolledStudents,
              this.usersGrades,
              this.activitiesStatusArray,
              this.courseStatusArray
            )
          )
          swal(
            '',
            'Usuário matriculado',
            'success'
          )
        }
      },
      err => console.error(err)
    );
  }
  unenrolUser(user){
    swal({
      title: 'Desmatricular usuário',
      text: 'Tem certeza que deseja desmatricular o usuário ' + user.name+ '?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then((result) => {

      if (result.value) {
        let enrolments =
          '&enrolments[0][roleid]=5'+
          '&enrolments[0][userid]='+user.id +
          '&enrolments[0][courseid]='+this.course.id

        const params ={
          wstoken: this.form_moodle.token,
          enrolments: enrolments
        }
        this.moodleApiService.enrol_manual_unenrol_users(this.form_moodle.url, params).subscribe(
          data => {
            if(data == null){
              var i;
              this.dataSource.data.find(
                (element, index)=>{
                  i = index;
                  return element.id == user.id
                }
              )
              this.dataSourcePrepared.data.splice(i,1);
              this.dataSource = this.dataSourcePrepared
              swal(
                '',
                'Usuário desmatriculado',
                'success'
              )
            }
            else{
              swal(
                '',
                'Erro ao desmatricular usuário',
                'error'
              )
            }
          },
          err => console.error(err)
        );
      }
    })
  }
  userReport(user){
    var resultG: any[] = [];
    var resultC: any[] = [];
    let params = {
      wstoken: this.form_moodle.token,
      userid: user.id
    }

    this.moodleApiService.gradereport_overview_get_course_grades(this.form_moodle.url, params).subscribe(
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
            wstoken: this.form_moodle.token,
            coursesid: courseids()
          }

          this.moodleApiService.core_course_get_courses(this.form_moodle.url, params).subscribe(
            data => { resultC = data; },
            err => {},
            () => {
              let dialogRef = this.dialog.open(DisplayUsersDialogComponent, {
                width: '1500px',
                height: '800px',
                data: {
                  name: user.name,
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
