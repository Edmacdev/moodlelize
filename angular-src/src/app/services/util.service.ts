import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'


@Injectable()
export class UtilService {

  private status1 = new BehaviorSubject<boolean>(false);
  private status2 = new BehaviorSubject<boolean>(false);
  private ismoodleSelected = new BehaviorSubject<boolean>(false);

  private array :BehaviorSubject<boolean>[] =[this.status1,this.status2]

  currentStatus1 = this.array[0].asObservable();
  currentStatus2 = this.array[1].asObservable();

  currentIsMoodleSelected = this.ismoodleSelected.asObservable();

  moodleSelectedIndex: number = null;


  constructor() { }

  updateStatus(status: boolean, index){
    this.array[index].next(status);
  }
  setMoodleSelected(index){
    this.moodleSelectedIndex = index;
  }
  updateStatusIsMoodleSelected(status){
    this.ismoodleSelected.next(status)
  }
  getMoodleSelectedIndex(){
    return this.moodleSelectedIndex;
  }


}
