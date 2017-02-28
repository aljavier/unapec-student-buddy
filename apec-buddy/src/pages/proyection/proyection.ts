import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ToastController } from 'ionic-angular';
import { PensumsUniv } from '../../providers/pensums-univ';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { School } from '../../models/school';
import { Quarter } from '../../models/quarter';
import { Career } from '../../models/career';
import { Subject } from '../../models/subject';

import { Calification } from '../../enums/Calification';

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
  
  public Calification = Calification;
  
  schools: Array<School>;
  careers: Array<Career>;
  selectedSchool: School;
  selectedCareer: Career;
  GPA: number = 0.00;
  quarterList: Array<Quarter>;
  
  constructor(public navCtrl: NavController, public alertCtrl: AlertController,  
      private pensums: PensumsUniv, private toastCtrl: ToastController) { }

  ionViewDidLoad() {  }

  ngOnInit(): void {
     this.pensums.load().then(resp => this.schools = resp);
  }
  
  changeSchool(selected): void {
       this.careers = selected.careers;
       this.selectedCareer = null;
       this.quarterList = Array<Quarter>();
  }
  
  changeCareer(career): void {
    this.quarterList.push(career.pensum[0]); // Primer cuatrimestre
  }
  
  changeCalification(subject): void {
    let alert = this.alertCtrl.create();
    alert.setTitle('Calificación');

    alert.addInput({ 
      type: 'radio',
      label: 'A (90-100)',
      value: Calification[Calification.A],
      checked: (subject.calification == Calification.A)
    });
    
    alert.addInput({ 
      type: 'radio',
      label: 'B (80-89)',
      value: Calification[Calification.B],
      checked: (subject.calification == Calification.B)
    });
    
    alert.addInput({ 
      type: 'radio',
      label: 'C (70-79)',
      value: Calification[Calification.C],
      checked: (subject.calification == Calification.C)
    });
    
    alert.addInput({ 
      type: 'radio',
      label: 'D (60-69, Reprobado)',
      value: Calification[Calification.D],
      checked: (subject.calification == Calification.D)
    });
    
    alert.addInput({ 
      type: 'radio',
      label: 'F (0-59, Reprobado)',
      value: Calification[Calification.F],
      checked: (subject.calification == Calification.F)
    });
    
    alert.addInput({
      type: 'radio',
      label: 'Retirada',
      value: Calification[Calification.R],
      checked: (subject.calification == Calification.R)
    });
    
    alert.addInput({
      type: 'radio',
      label: 'Exonerada',
      value: Calification[Calification.E],
      checked: (subject.calification == Calification.E)
    });
    
    alert.addInput({
      type: 'radio',
      label: 'Convalidada',
      value: Calification[Calification.CO],
      checked: (subject.calification == Calification.CO)
    });
    
    alert.addButton('Cancelar');
    alert.addButton({
      text: 'OK',
      handler: data => {
        subject.calification = Calification[data];
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
  
  addQuarters(quarters: Array<Quarter>): void {
    let alert = this.alertCtrl.create();
    alert.setTitle('Cuatrimestres');

    for (var idx = 0; idx < quarters.length; idx++) {
        if (this.quarterList.indexOf(quarters[idx]) > -1 ) { // Ya esta agregado
            continue;
        } else {
          alert.addInput({
            type: 'checkbox',
            label: quarters[idx].description,
            value: idx.toString(),
            checked: false
           });
        }
    }
    
    alert.addButton('Cancelar');
    alert.addButton({
          text: 'OK',
          handler: data => {
            console.log(data);
            let total = 0;
            let _quarter = null;
            
            for (var idx = 0; idx < data.length; idx++) {
                try {
                    _quarter = this.selectedCareer.pensum[parseInt(data[idx])];
                    _quarter.subjects = this.getNotDuplicatedSubjects(_quarter.subjects, this.quarterList);
                    this.quarterList.push(_quarter);
                    
                    total++;
                  } catch (Error){
                    console.log("Error intentando agregar cuatrimestre " + data[idx] + ": " + Error.message);
                }
            }
            if (total == 1) {
                this.showToast(_quarter.description + ' agregado!');
            } else {
                this.showToast(total + " cuatrimestres agregado!");
            }
          }
    });
        
    alert.present();
  }
  
  addQuarter(): void {
    // Nos aseguramos que el número de cuatrimestre no excede la cantidad
    // total de la carrera. Si no excede ni es igual entonces agregamos
    // el siguiente cuatrimestre.
    if (this.quarterList.length < this.selectedCareer.pensum.length) {
        if (this.quarterList.length == 0) {
             let _quarter = this.selectedCareer.pensum[this.quarterList.length];
            
            _quarter.subjects = this.getNotDuplicatedSubjects(_quarter.subjects, this.quarterList);
            this.quarterList.push(_quarter);
            this.showToast(_quarter.description + ' agregado!');
        } else {
            this.addQuarters(this.selectedCareer.pensum)       
        }
    }
  }
  
  removeQuarter(quarter: Quarter): void {
    let index = this.quarterList.indexOf(quarter);
    
    if (index > -1) this.quarterList.splice(index, 1);
  }
  
  showToast(message: string, position: string = 'center'): void {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3*1000,
      position: position
    }).present();
  }
  
  // Filtra las asignaturas, para devolver solo las que no se encuentran
  // ya en targetList.
  getNotDuplicatedSubjects(copyList: Array<Subject>, targetList: Array<Quarter>) : Array<Subject> {
    let _list = copyList;

    for (let q of targetList)
    {
        for (let idx = 0; idx < q.subjects.length; idx++)
        {
          let _index = _list.indexOf(q.subjects[idx]);
          if (_index > -1)
          {
            _list.splice(_index, 1);
          }
        }
    }
    // Sacar asignaturas con pre-requisitos no aprobados
    let filtratedList = _list.filter(x => x.pre_requisits.length > 0);
    for (let _elem of filtratedList)
    {
       let pre_requisits = _elem.pre_requisits.split(/\s+/);
       for (let q of targetList)
       {
         let _pre = q.subjects.filter(s => ((pre_requisits.indexOf(s.code) > -1) 
                                && ((s.calification > Calification.D) && s.calification <= Calification.A )));
         if (_pre.length > 0)
         {
           for (let s of _pre)
           {
             let index = _list.indexOf(s);
             if (index > -1) _list.splice(index, 1);
           }
         }
       }
    }
    //
    
    return _list;
  }
  
  getCalification(note: Calification) {
        switch(note) {
            case Calification.A:
                // TODO
            case Calification.B:
                // TODO
            case Calification.C:
                // TODO
            case Calification.D:
                // TODO
            case Calification.F:
                // TODO
            case Calification.R:
            case Calification.E:
            case Calification.CO:
            default:
                // TODO
        }
    }
}
