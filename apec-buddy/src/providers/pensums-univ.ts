import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Rx';

import { School } from '../models/school';

/*
  Generated class for the PensumsUniv provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class PensumsUniv {
  schools: Array<School>;
  
  url: string = 'pensums.json';
  
  constructor(public http: Http) {
    console.log('Hello PensumsUniv Provider');
    
  }
  
    load(): Promise<School[]> {
      return this.http.get(this.url)
              .toPromise()
              .then(resp => resp.json() as School[])
              .catch(this.handleError);
    }
    
    private handleError(error: any):  Promise<any> {
      console.error('An error occurred', error); 
      return Promise.reject(error.message || error);
    }

}
