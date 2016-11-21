import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
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
  GPA: number = 4.0;
  
  constructor(public navCtrl: NavController, public alertCtrl: AlertController,  private pensums: PensumsUniv ) {}

  ionViewDidLoad() {  }

  ngOnInit(): void {
     this.pensums.load().then(resp => this.schools = resp);
  }
  
  changeSchool(selected): void {
       this.careers = selected.careers;
       this.selectedCareer = null;
  }
  
  changeCalification(subject): void {
    let alert = this.alertCtrl.create();
    alert.setTitle('Calificación');
    
    alert.addInput({ 
      type: 'radio',
      label: 'A (90-100)',
      value: 'A',
      checked: (subject.calification == 'A')
    });
    
    alert.addInput({ 
      type: 'radio',
      label: 'B (80-89)',
      value: 'B',
      checked: (subject.calification == 'B')
    });
    
    alert.addInput({ 
      type: 'radio',
      label: 'C (70-79)',
      value: 'C',
      checked: (subject.calification == 'C')
    });
    
    alert.addInput({ 
      type: 'radio',
      label: 'D (60-69, Reprobado)',
      value: 'D',
      checked: (subject.calification == 'D')
    });
    
    alert.addInput({ 
      type: 'radio',
      label: 'F (0-59, Reprobado)',
      value: 'F',
      checked: (subject.calification == 'F')
    });
    
    alert.addButton('Cancelar');
    alert.addButton({
      text: 'OK',
      handler: data => {
        subject.calification = data;
      }
    });
    alert.present();
  }
  
  deleteSubject(quarter, subject): void {
    let confirm = this.alertCtrl.create({
      title: 'Confirmar',
      message: '¿Esta usted seguro que quiere eliminar esta asignatura de su proyección?',
      buttons: [
          {
            text: 'No',
          },
          {
            text: 'Sí',
            handler: () => {
              let indexQuarter = this.selectedCareer.pensum.indexOf(quarter);
              if (indexQuarter > -1){
                let index = this.selectedCareer.pensum[indexQuarter].subjects.indexOf(subject);
                if (index > -1) quarter.subjects.splice(index, 1);
              }
            }
          }
        ]
    });
    confirm.present();
  }
}
