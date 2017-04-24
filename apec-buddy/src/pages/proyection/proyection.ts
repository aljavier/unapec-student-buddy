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
import { Student } from '../../models/student';

import { Calification } from '../../enums/Calification';

import * as PouchDB from 'pouchdb';

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
  
  subjects: Array<Subject>; // Para la modal de agregar asignatura
  schools: Array<School>;
  careers: Array<Career>;
  student = new Student();
  db: any;
  db_name: string = 'proyection.db';
  
  constructor(public navCtrl: NavController, public alertCtrl: AlertController,  
      private pensums: PensumsUniv, private toastCtrl: ToastController) {
        
        this.db = new PouchDB(this.db_name);
  }
  
  ngOnInit(): void {
      this.pensums.load().then(resp => {
          this.schools = resp as School[];
          this.getProyection();
      });
  }
  
  changeSchool(selected): void {
       this.careers = selected.careers;
       this.student = new Student();
       this.student.school = selected as School;
  }
  
  changeCareer(career): void {
    this.student.career = career as Career
    this.student.quarterList.push(this.student.career.pensum[0]); // Agregamos primer cuatrimestre
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
    this.showConfirm('¿Esta usted seguro que quiere eliminar esta asignatura de su proyección?', () => {
        let indexQuarter = this.student.career.pensum.indexOf(quarter);
              if (indexQuarter > -1){
                let index = this.student.career.pensum[indexQuarter].subjects.indexOf(subject);
                
                if (index > -1) quarter.subjects.splice(index, 1);
              }
    });
  }
  
  addSubjects(index: number): void {
    console.log('Addsubjects reporting for duty!');
    if ((this.subjects == null) || (this.subjects.length == 0)) {
        this.subjects = Array<Subject>();
        for (let idx = 0; idx < this.student.quarterList.length; idx++) {
            this.student.quarterList[idx].subjects.map(x => this.subjects.push(x));
        }
    }
    
    // Asignaturas no duplicadas y sin pre-requisitos
    let _quarters : Array<Quarter> = [this.student.quarterList[index]];
    let copySubjects = this.getNotDuplicatedSubjects(this.subjects, _quarters);
   
    if (copySubjects.length == 0)
    {
       console.log('No more subjects...');
       this.showMessage('No asignaturas...', 
        'No hay más asignaturas sin pre-requisitos que puedas tomar.');
    
       return;
    }
   
    let alert = this.alertCtrl.create();
    alert.setTitle('Agregar asignaturas');
    
    for (var idx = 0; idx < copySubjects.length; idx++) {
        alert.addInput({
            type: 'checkbox',
            label: copySubjects[idx].name,
            value: idx.toString(),
            checked: false
        });
    }
    
    alert.addButton('Cancelar');
    alert.addButton({
          text: 'OK',
          handler: data => {
            let _total = 0;
            let _subject : Subject = null;
             
            for (var idx = 0; idx < data.length; idx++) {
                try 
                {
                    _subject = copySubjects[parseInt(data[idx])];
                    this.student.quarterList[index].subjects.push(_subject);      
                    _total++;
                    
                  } catch (Error){
                    console.log("Error intentando agregar cuatrimestre " + data[idx] + ": " + Error.message);
                }
            }
            
            if (_total > 0) {
              if (_total == 1) {
                  this.showToast(_subject.name + ' agregado!');
              } else {
                  this.showToast(_total + " cuatrimestres agregado!");
              }
              this.save();
            }
          }
    });
        
    alert.present();
  }
  
  addQuarters(quarters: Array<Quarter>): void {
    let alert = this.alertCtrl.create();
    alert.setTitle('Cuatrimestres');

    for (var idx = 0; idx < quarters.length; idx++) {
        if (this.student.quarterList.indexOf(quarters[idx]) > -1 ) { // Ya esta agregado
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
            let total = 0;
            let _quarter = null;
            
            for (var idx = 0; idx < data.length; idx++) {
                try {
                    _quarter = this.student.career.pensum[parseInt(data[idx])];
                    
                    if (_quarter != this.student.career.pensum[0]) {
                        _quarter.subjects = this.getNotDuplicatedSubjects(_quarter.subjects, this.student.quarterList);
                    }
                   
                    this.student.quarterList.push(_quarter);
                    
                    total++;
                  } catch (Error){
                    console.log("Error intentando agregar cuatrimestre " + data[idx] + ": " + Error.message);
                }
            }
            if (total > 0) {
                if (total == 1) {
                    this.showToast(_quarter.description + ' agregado!');
                } else {
                    this.showToast(total + " cuatrimestres agregado!");
                }
                this.save();
            }
          }
    });
        
    alert.present();
  }
  
  addQuarter(): void {
    if (this.student.quarterList.length < this.student.career.pensum.length) {
       this.addQuarters(this.student.career.pensum);
    }
  }
  
  removeQuarter(quarter: Quarter): void {
    this.showConfirm('¿Esta usted seguro que quiere eliminar este cuatrimestre de su proyección?', () => {
      
        let index = this.student.quarterList.indexOf(quarter);
      
        if (index > -1) 
        {
          this.student.quarterList.splice(index, 1);
          this.save();
        }
        
     });
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
    
    if (targetList.length == 0) return Array<Subject>();
    
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
         let _pre = q.subjects.filter(s => ((pre_requisits.indexOf(s.code) > -1) // Todas las asignaturas  aprobadas
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
  
  showMessage(title: string, message: string)
  {
     let confirm = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
          {
            text: 'OK',
          },
        ]
    });
    confirm.present();
  }
  
  showConfirm(message: string, callback: () => any) 
  {
    let confirm = this.alertCtrl.create({
      title: 'Confirmar',
      message: message,
      buttons: [
          {
            text: 'No',
          },
          {
            text: 'Sí',
            handler: () => {
              callback();
            }
          }
        ]
    });
    confirm.present();
  }

  save() {
    console.log("here is student!!!!");
    console.log(this.student);
    if ((this.student != null) && (this.student.quarterList.length > 0)) {
        var data = {
          _id: "proyection",
          _rev: "",
          student: this.student
        };
        var self = this; // Insane!
        // Ref. https://github.com/pouchdb/pouchdb/issues/1691#issuecomment-38112213
        this.db.get(data._id).then(function (oldData) {
          data._rev = oldData._rev;
          console.log("I'm going to save...");
          console.log(data);
          return self.db.put(data);
        }).catch(function (err) {
          if (err.status == 409) {
            return self.save(); // Crazy, right?
          } else { // new data
          console.log("this is data..");
          console.log(data);
            return self.db.put(data);
          }
        });
        
        console.log("Guardado!");
    }
  }
  
  getProyection() {
    var _data = this.db.get("proyection").catch(function (err) {
      if (err.name == 'not_found') {
        return {
          _id: "proyection",
          _rev: "",
          student: new Student()
        };
      }
    }).then(resp => {
          this.student.school =  this.schools.filter(x => x.code == resp.student.school.code)[0];
          this.careers = this.student.school.careers;
          this.student.career = this.careers.filter(x => x.code == resp.student.career.code)[0];
          this.student.quarterList = resp.student.quarterList;
      }).catch(err => {
       console.log("Error getting stored proyection: " + err);
    });
  }

}