import { Component, OnInit } from '@angular/core';
import { MoodleApiService } from '../../services/moodle-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  results: [any];
  data: Object;
  user: {
    email: {
      type: String,
      require: true
    },
    username: {
      type: String,
      require: true
    },
    password: {
      type: String,
      required: true
    },
    moodles: [
      {
        url: String,
        name: String,
        token:String
      }
    ]
  });
  filter: = "tudo";

  constructor(
    private moodleApiService: MoodleApiService,
    private authService: AuthService
  ) { }

  ngOnInit() {

    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user;

    },
    err => {
      console.log(err);
      return false;
    });

    $('.filterList > li').click( () => {
      console.log($('.filterList > li').children())
    });


  }
  onSubmit(value){
      this.results = [];
    for( let i = 0; i < this.user.moodles.length; i++){

      this.moodleApiService.core_course_search_courses(this.user.moodles[i].url, this.user.moodles[i].token, value).subscribe(data => {
        if(data){

          this.data = data;
          Object.defineProperty(this.data, "moodle", {value:this.user.moodles[i]});


          this.results.push(this.data);
          console.log(this.results)

        }else{
          console.log('erro');
        }
      });
    }
  }


}
