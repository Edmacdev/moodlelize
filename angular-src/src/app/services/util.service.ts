import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'


@Injectable()
export class UtilService {
  private status = new BehaviorSubject<boolean>(false);
  currentStatus = this.status.asObservable();

  // moodlesStatus: BehaviorSubject<boolean>[] = [];
  moodlesStatus: any[];


  constructor() { }

  updateStatus(status: boolean){
    this.status.next(status);
  }

  initMoodlesStatus(moodles){
    var observablesArray = [];
    for(let i in moodles){
      let status = new BehaviorSubject<boolean>(false)
      observablesArray.push(status)
      // this.moodlesStatus.push(status);
      // console.log(this.moodlesStatus[i].asObservable())
      // this.moodlesStatus[i].asObservable().subscribe(data => {console.log(data)})
    }
    // console.log(observablesArray)

    Observable.forkJoin(observablesArray).subscribe(
      data => {this.moodlesStatus = data as any[]; },
      err => {console.log(err)},
      () => {}

  );

    // this.moodlesStatus.subscribe(data => {console.log(data)})

  }

  warning(msg){
    console.log(msg)
  }

}
