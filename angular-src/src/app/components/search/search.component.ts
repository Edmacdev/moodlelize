import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { AuthService } from '../../services/auth.service';
import {Observable} from 'rxjs/Rx'
import { Router } from '@angular/router';

declare var $:any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
//
//   results: Object[];
//   data: {
//     users:[Object];
//   }
//   user: {
//     email: {
//       type: String,
//       require: true
//     },
//     username: {
//       type: String,
//       require: true
//     },
//     password: {
//       type: String,
//       required: true
//     },
//     moodles: [
//       {
//         url: String,
//         name: String,
//         token:String
//       }
//     ]
//   };
//   filter: String;
//   isResult = false;
//
//   constructor(
//     private moodleApiService: MoodleApiService,
//     private authService: AuthService,
//     private router: Router
//   ) { }
//
  ngOnInit() {
//     this.filter = 'tudo';
//
//     this.authService.getProfile().subscribe(profile => {
//       this.user = profile.user;
//     },
//     err => {
//       console.log(err);
//       return false;
//     });
//
  }
//
//   onSubmit(value){
//     this.isResult = true;
//     this.results = [];
//
//       switch(this.filter){
//         case 'tudo':
//
//
//         break;
//
//         case 'usuários':
//
//           for (let i =0; i<this.user.moodles.length; i++){
//
//             let userParams = {
//               wstoken: this.user.moodles[i].token,
//               wsfunction:'core_user_get_users',
//               moodlewsrestformat:'json',
//               value: value,
//             }
//
//               const req_firstname$ = this.moodleApiService.core_user_get_users(this.user.moodles[i].url, userParams, 'firstname' );
//               const req_lastname$ = this.moodleApiService.core_user_get_users(this.user.moodles[i].url, userParams, 'lastname' );
//               const req_email$ = this.moodleApiService.core_user_get_users(this.user.moodles[i].url, userParams, 'email' );
//               const req_userid$ = this.moodleApiService.core_user_get_users(this.user.moodles[i].url, userParams, 'id' );
//               const combined$ = Observable.concat(
//                 req_firstname$,
//                 req_lastname$,
//                 req_email$,
//                 req_userid$,
//               ).take(5)
//
//               combined$.subscribe(data => {
//                 Object.defineProperty(data, "moodleName", {value:this.user.moodles[i].name});
//
//                 this.results.push(data)
//                 console.log(this.results)
//               });
//           }
//
//             // this.moodleApiService.core_user_get_users(this.user.moodles[i].url, userParams, j, name).subscribe(data => {
//             //
//             //   this.data = data;
//             //
//             //   Object.defineProperty(this.data.users, "moodleName", {value:this.user.moodles[i].name});
//             //   this.results.push(this.data)
//             // });
//
//           // }
//
//
//         break;
//
//         case 'cursos':
//
//           let courseParams = {
//             wstoken: this.user.moodles[0].token,
//             wsfunction:'core_course_search_courses',
//             moodlewsrestformat:'json',
//             criterianame: 'search',
//             criteriavalue: value
//           }
//
//           this.moodleApiService.core_course_search_courses(this.user.moodles[0].url, courseParams).subscribe(data => {
//             if(data){
//
//               this.data = data;
//               Object.defineProperty(this.data, "moodle", {value:this.user.moodles[0]});
//               this.results.push(this.data);
//               console.log(this.results)
//             }else{
//               console.log('erro');
//             }
//           });
//         break;
//
//       }
//   }
//   dataFilter(data){
//
//     for (let j = 0; j<data.length; j++ ){
//       if(data[j].users.length == 0){
//         data.slice(j);
//       }
//     }
//     return data;
//   }
//   onListItemClick (id){
//     this.router.navigate(['./user/' + id]);
//   }
}
