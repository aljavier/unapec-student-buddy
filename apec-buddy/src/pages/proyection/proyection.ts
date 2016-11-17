import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { PensumsUniv } from '../../providers/pensums-univ';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { School } from '../../models/school';
import { Career } from '../../models/career';
/*
  Generated class for the Proyection page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-proyection',
  templateUrl: 'proyection.html'
})
export class ProyectionPage implements OnInit {
  schools: Array<School>;
  careers: Array<Career>;
  selectedSchool: School;
  selectedCareer: Career;
  
  constructor(public navCtrl: NavController, private pensums: PensumsUniv ) {}

  ionViewDidLoad() {
    console.log('Hello ProyectionPage Page');
  }

  ngOnInit(): void {
     this.pensums.load().then(resp => this.schools = resp);
  }
  
  changeSchool(selected): void {
       this.careers = selected.careers;
  }
}
