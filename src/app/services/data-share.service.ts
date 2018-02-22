import { Injectable } from '@angular/core';

@Injectable()
export class DataShareService {
  data: any;
  constructor() { }

  setData(data){
    this.data = data;
  }
  getData(){
    return this.data;
  }

}
