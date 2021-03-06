import { Component, OnInit, ViewChild} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MoodleService } from '../../services/moodle.service';
import { MoodleApiService } from '../../services/moodle-api.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DisplayUsersDialogComponent } from '../display-users-dialog/display-users-dialog.component';
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
//USUÁRIO DO SISTEMA
  user: any;
//MOODLES REGISTRADOS NO SISTEMA
  moodles: any[];
//CURSOS REGISTRADOS NO MOODLE
  courses: any[];
  //CURSO SELECIONADO PARA RELATORIO
  course: any;
  user_info: object;
//USUÁRIOS MATRICULADOS NO CURSO
  enrolled_users: any[] = [];
  enrolled_teachers: any[] = [];
  enrolled_students: any[] = [];
//ATIVIDADES CONCLUIDAS E NOTAS DOS ALUNOS
  activities_status: any[] = []
  course_status_array: any[] = []
  user_grades: any[];
//FORMS
  form_moodle: any;
  form_courseid: number;
//TIMER
  timer: any;
//STATUS
  is_ready: boolean = false;
  is_loading: boolean = false;
  is_course_finished: boolean = false;
  is_course_selected: boolean = false;
//DATA TABLE
  display_columns: string[] = ['risk', 'name', 'email','phone','lastaccess', 'progress', 'grade','options'];
  display_columns_result: string[] = ['name', 'email','phone','result', 'grade','options'];
  display_columns_users_result: string[] = ['name', 'email','chekbox']
  data_source: MatTableDataSource<any>;
  data_source_users_result: MatTableDataSource<any>;
  selected_user_info: object;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;
//ENROL USER TAB
  form_ctrl = new FormControl();
  fg_search_users: FormGroup;
  form_opt: number;
  form_opt_query: number;
  form_query: string;
  options: string[] = ['id', 'nome', 'sobrenome', 'usuário', 'email'];
  options_query: string[] = ['igual a', 'contém', 'contém antes', 'contém depois'];
  users_list: any[] =[];
  selected_users_for_enrollment: any[] = [];

  constructor(
    private authService: AuthService,
    private moodleService: MoodleService,
    private moodleApiService: MoodleApiService,
    public dialog: MatDialog,
    private fb: FormBuilder
  ) {
    //CONTROLE DE FORMULÁRIO
    this.fg_search_users = fb.group({
      'qry':[null, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])]
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
              }
            }
          )
        }
      }
    )
  }
  //função que busca os cursos de um determinado Moodle
  getCourses():void{
    const params:object = {
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
  //função que acessa o webservice para buscar e armazenar as informações dos usuários matriculados
  report():void{
    this.is_ready = false;
    this.is_loading = true;
    this.course = this.courses[this.form_courseid];
    this.is_course_selected = true;
    this.activities_status = [];
    this.course_status_array = [];
    clearInterval(this.timer)
    //inicia o timer
    let now = new Date().getTime();
    let countdown = (this.course.enddate *1000)+86400000*1;
    if(countdown - now < 0) this.is_course_finished = true;
    this.countdownTimer(this.course)
    //variaveis para uso do webservice
    var wstoken: string = this.form_moodle.token;
    var url: string = this.form_moodle.url;
    var courseid: string = this.course.id
    //status do carregamento da pagina
    var status: boolean[] = [false, false] ;
    var status_subject: Subject<string> = new Subject();
    //Inscrição que observa a mudança de status
    status_subject.subscribe(
      data => {
        switch(data){
          case 'enrolled_users':
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
          this.data_source = new MatTableDataSource(
            this.prepareDataSource(
              this.enrolled_students,
              this.user_grades,
              this.activities_status,
              this.course_status_array
            ))
          this.is_ready = true;
          this.is_loading = false;

          setTimeout(
            () => {
              this.data_source.paginator = this.paginator;
              this.data_source.sort = this.sort;

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
                  this.changeUserInfoHandler(this.selected_user_info, event)
                }
              )
              $(".user-info").keyup(
                (event) =>{
                  if(event.which == 13){
                    this.changeUserInfoHandler(this.selected_user_info, event)
                  }
                }
              )
            },400
          )
        }
        else this.is_ready = false;
      }
    )
    //BUSCAR USUÁRIOS MATRICULADOS
    let enrolled_users;
    this.moodleApiService.core_enrol_get_enrolled_users(url,{wstoken: wstoken,courseid: courseid})
    .subscribe(
      data => {
        if(data.errorcode){
          return false;
        }
        if(data.length > 0){

          this.enrolled_users = data;
          this.enrolled_teachers = data.filter(element =>  element.roles[0].roleid == 3);
          this.enrolled_students = data.filter(element =>  element.roles[0].roleid == 5);
          this.enrolled_students = this.enrolled_students.sort((a,b) => a.fullname.localeCompare(b.fullname));
          status_subject.next('enrolled_users');

          //BUSCAR NOTAS DOS ALUNOS

          this.moodleApiService.gradereport_user_get_grade_items(url,{wstoken: wstoken,courseid: courseid})
          .subscribe(
            data => {
              if(data.errorcode){
                return false;
              }
              this.user_grades= data.usergrades.sort((a,b) => a.userfullname.localeCompare(b.userfullname));

              if(!this.is_course_finished){
                //BUSCAR ATIVIDADES FEITAS POR ALUNOS
                let activitiesStatusRequestArray: any[] =[]
                for(let i in this.user_grades){
                  let userid = this.user_grades[i].userid
                  let request = this.moodleApiService.core_completion_get_activities_completion_status(url,{wstoken: wstoken,courseid: courseid, userid: userid});
                  this.activities_status.push(request);
                }
                forkJoin(this.activities_status).subscribe(
                  result => {
                    this.activities_status = result;
                    status_subject.next('usersActivitiesCompletion');
                  }
                )
              }
              else{
                //VERIFICAR SE USUÁRIO CONCLUIU O CURSO
                let courseStatusRequestArray: any[] =[]
                for(let i in this.user_grades){
                  let userid = this.user_grades[i].userid
                  let request = this.moodleApiService.core_completion_get_course_completion_status(url,{wstoken: wstoken,courseid: courseid, userid: userid})
                  this.course_status_array.push(request)
                }
                forkJoin(this.course_status_array).subscribe(
                  result => {
                    this.course_status_array = result;
                    status_subject.next('usersCourseCompletion');

                  }
                )
              }
            }
          )

        }
        else this.is_ready = true;

    })
  }
  //Cria um timer de contagem regressiva
  countdownTimer(course:any):void{

    // Atualiza a contagem a cada 1 segundo

    this.timer = setInterval(() =>{
      // data e hora
      var now = new Date().getTime();
      var countDownDate = (course.enddate *1000)+86400000*1;
      // Calcula diferença entre agora e data final
      var distance = countDownDate - now;

      if(distance > 0){
        $(".course-end").html("");
        $(".countdown").show()

        // Calculo para dias, horas, minutos e segundos
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Mostra o resultado na view
        $(".days").html(days);
        $(".hours").html(hours);
        $(".minutes").html(minutes);
        $(".seconds").html(seconds);
      }

      //Ações para quando o timer chegar ao fim
      if (distance < 0) {
        clearInterval(this.timer);
        $(".course-end").html("<h3>CURSO ENCERRADO</h3>");
        $(".countdown").hide();
        this.is_course_finished = true;
      }
      else     this.is_course_finished = false;
    }, 1000);
  }
  //Função que retorna o tempo de duração do curso
  courseTime(course:any):any{
    let now:number = new Date().getTime();
    let enddate:number = course.enddate *1000;
    let startdate:number = course.startdate *1000;
    let distance:number = now - startdate;
    let duration:number = enddate - startdate;
    let progress:number = Math.floor((distance *100) / duration)
    let courseTime:object = {
      duration: duration,
      progress: progress
    }
    return courseTime

  }
  //Calcula o número de dias desde o último acesso
  getDaysSinceLastAccess(last_access):number{
    if(last_access == 0){
      return null
    }
      let lastaccess = new Date(last_access *1000);
      let currentdate = new Date();
      let timeDiff = Math.abs(currentdate.getTime() - lastaccess.getTime());
      let diffDays = Math.floor(timeDiff / (1000 * 3600));
      return diffDays ;
  }
  //conversor de horas para dias
  hoursToDays(hours:number):string{
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
  //Gera os gráficos
  chartRender(chart:string):void{
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
          data1 = this.data_source.data.filter(elem => elem.lastaccess/24 == null).length;
          data2 = this.data_source.data.filter(elem => elem.lastaccess/24 < days(5)).length;
          data3 = this.data_source.data.filter(elem => elem.lastaccess/24 >= days(5) && elem.lastaccess/24 < days(10) ).length;
          data4 = this.data_source.data.filter(elem => elem.lastaccess/24 >= days(10) && elem.lastaccess/24 < days(25) ).length;
          data5 = this.data_source.data.filter(elem => elem.lastaccess/24 >= days(25) && elem.lastaccess/24 < days(50) ).length;
          data6 = this.data_source.data.filter(elem => elem.lastaccess/24 > days(50)).length;
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

        data1 = this.data_source.data.filter(elem => elem.progress == 0).length;
        data2 = this.data_source.data.filter(elem => elem.progress >= 1 && elem.progress <= 20).length;
        data3 = this.data_source.data.filter(elem => elem.progress >= 21 && elem.progress <= 40).length;
        data4 = this.data_source.data.filter(elem => elem.progress >= 41 && elem.progress <= 60).length;
        data5 = this.data_source.data.filter(elem => elem.progress >= 61 && elem.progress <= 80).length;
        data6 = this.data_source.data.filter(elem => elem.progress >= 81 && elem.progress <= 100).length;
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
        data1 = this.data_source.data.filter(elem => elem.grade == -1).length;
        data2 = this.data_source.data.filter(elem => elem.grade >= 1 && elem.grade <= 20).length;
        data3 = this.data_source.data.filter(elem => elem.grade >= 21 && elem.grade <= 40).length;
        data4 = this.data_source.data.filter(elem => elem.grade >= 41 && elem.grade <= 60).length;
        data5 = this.data_source.data.filter(elem => elem.grade >= 61 && elem.grade <= 80).length;
        data6 = this.data_source.data.filter(elem => elem.grade >= 81 && elem.grade <= 100).length;
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
  //filtro para as informações da tabela
  applyFilter(filterValue: string): void {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.data_source.filter = filterValue;
  }
  //Prepara os dados obtidos do moodle para ser usado na tabela
  prepareDataSource(enrolled_students, user_grades, activitiesCompletion, courseCompletion){

      let data_source:any[] = [];

      for (let i in enrolled_students){
        let uid:string = enrolled_students[i].id;
        let name:string = enrolled_students[i].fullname;
        let firstname:string = enrolled_students[i].firstname;
        let lastname:string = enrolled_students[i].lastname;
        let email:string = enrolled_students[i].email;
        let phone:string = enrolled_students[i].phone1;
        let enrolledcourses = enrolled_students[i].enrolledcourses

        //last access
        let lastaccess = this.getDaysSinceLastAccess(enrolled_students[i].lastaccess);

        //grade
        let gradeitems =user_grades.find((element)=>{return element.userid == uid}).gradeitems
        let grade = gradeitems[gradeitems.length - 1].graderaw;
        if(!grade) grade = -1;
        if(!this.is_course_finished){
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
              enrolledcourses: enrolledcourses,
              lastaccess: lastaccess,
              progress: progress,
              grade: grade,
              risk: risk,
              icon:''
            }
            data_source.push(elem);
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
            enrolledcourses: enrolledcourses,
            grade: grade,
            result: result
          }
          data_source.push(elem);
        }
      }
      if(this.is_course_finished) return data_source;
      else {
        data_source.sort((a,b) => a.risk.localeCompare(b.risk));
        return data_source.reverse();
      }

  }
  //Muda o título do curso registrado no moodle
  changeTitle(title:string){
    const params ={
      wstoken: this.form_moodle.token,
      courseid: this.course.id,
      fullname: title
    }
    return this.moodleApiService.core_course_update_courses(this.form_moodle.url, params);
  }
  //Altera informações de usuário registrado no moodle
  changeUserInfo(user:any, value:string){
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
    var dataSourceUser = this.data_source.data
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
                if(user.type == 'firstname') this.data_source.data[i].firstname = $("#firstname"+user.id).val();
                else if(user.type == 'lastname') this.data_source.data[i].lastname = $("#lastname"+user.id).val();
                else if(user.type == 'email') this.data_source.data[i].email = $("#email"+user.id).val();
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
  //Armazena informações do usuário selecionado para alterar informações
  setCurrentUserInfo(id, type){
    const userInfo = {
      id: id,
      type: type
    }
    this.selected_user_info = userInfo;
  }
  //Altera a cor da linha da tabela de acordo com uma condição
  getRowColor(condition){

    if(condition == '1 - baixo') return 'rgba(54, 162, 235, 0.1)';
    else if(condition == '2 - médio') return 'rgba(255, 206, 86, 0.1)';
    else if(condition == '3 - alto') return 'rgba(255, 0, 0, 0.1)';
    else if(condition == 'Aprovado') return 'rgba(54, 162, 235, 0.1)';
    else if(condition == 'Reprovado') return 'rgba(255, 0, 0, 0.1)';
    else if(condition == 'Sem Critério') return 'rgba(255, 206, 86, 0.1)';
    else if(condition == 'Desconhecido') return 'rgba(255, 206, 86, 0.1)';
  }
  //Converte o formato da data
  formatDate(date){
    let dateFormat = new Date(date*1000)
    return dateFormat
  }
  print(){
    window.print();
  }
  //Busca usuários registrados no moodle que atendam aos critérios de pesquisa
  getUsers(query, fieldIndex, queryIndex){
    var options: string[] = ['id', 'firstname', 'lastname', 'username', 'email'];
    var params;
    switch(queryIndex){
      case 0:
      params = {
        wstoken: this.form_moodle.token,
        criteriakey: options[fieldIndex],
        criteriavalue: query
      }
      break
      case 1:
      params = {
        wstoken: this.form_moodle.token,
        criteriakey: options[fieldIndex],
        criteriavalue: '%' + query + '%'
      }
      break
      case 2:
      params = {
        wstoken: this.form_moodle.token,
        criteriakey: options[fieldIndex],
        criteriavalue: query + '%'
      }
      break
      case 3:
      params ={
        wstoken: this.form_moodle.token,
        criteriakey: options[fieldIndex],
        criteriavalue: '%' + query
      }
      break
    }
    this.moodleApiService.core_user_get_users(this.form_moodle.url, params)
      .subscribe(
        data => {
          this.users_list = data.users.sort((a,b) => a.fullname.localeCompare(b.fullname));
        },
        err => console.log(err)
      )
  }
  //Decide quais gráficos vão renderizar de acordo com a situação do curso
  tabChange(event):void{
    //Caso a aba 'Gráficos seja escolhida'
    if(event.index == 1){
      if(this.is_course_finished){
        //Renderiza apenas o gráfico de notas caso o curso tenha finalizado
        this.chartRender('grades')
      }
      else{
        //Renderiza todos os gráficos caso o curso ainda esteja em andamento
        this.chartRender('access')
        this.chartRender('progress')
        this.chartRender('grades')
      }
    }
  }
  //adiciona ou remove usuários da lista de usuários para matrícula
  checkUser(event, user){
    if(event.selected){
      this.selected_users_for_enrollment.push(user);
    }
    else{
      var i;
      this.selected_users_for_enrollment.find(
        (element, index)=>{
          i = index;
          return element.id == user.id
        })
      this.selected_users_for_enrollment.splice(i,1);
    }
  }

  enrolUsers(){
    let enrolments: string ='';
    for(let i in this.selected_users_for_enrollment){
      let enrolment =
      '&enrolments['+i+'][roleid]=5'+
      '&enrolments['+i+'][userid]='+this.selected_users_for_enrollment[i].id +
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

          swal(
            '',
            'Usuário matriculado',
            'success'
          )
          this.report()
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
              this.data_source.data.find(
                (element, index)=>{
                  i = index;
                  return element.id == user.id
                }
              )
              swal(
                '',
                'Usuário desmatriculado',
                'success'
              )
              this.report();
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
      data => {
        resultG = data.grades;

        if (user.enrolledcourses !== 0){
          var courseids = function() {
            let courseidsString = '';
            for (let i in user.enrolledcourses){
              courseidsString += '&options[ids][' + [i] + ']=' + user.enrolledcourses[i].id ;
            }
            return courseidsString
          }

          let params = {
            wstoken: this.form_moodle.token,
            coursesid: courseids()
          }
          this.moodleApiService.core_course_get_courses(this.form_moodle.url, params).subscribe(
            data => { resultC = data;},
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
      },
      err => {console.log(err); return false},
    )
  }
  log(e){
    console.log(e)
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
