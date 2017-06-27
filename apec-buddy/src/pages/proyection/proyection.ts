import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ToastController } from 'ionic-angular';
import { PensumsUniv } from '../../providers/pensums-univ';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { School } from '../../models/school';
import { Quarter } from '../../models/quarter';
import { Career } from '../../models/career';
import { Subject } from '../../models/subject';
import { Student } from '../../models/student';
import { Logger } from '../../utilities/logger';
import { UIHelper } from '../../utilities/uihelper';

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

    UIHelper.newCalificationModal(this.alertCtrl, subject, data => {
      subject.calification = Calification[data];
    }).present();
  }

  deleteSubject(quarter, subject): void {
    var msg = '¿Esta usted seguro que quiere eliminar esta asignatura de su proyección?';

    UIHelper.showConfirm(this.alertCtrl, msg, () => {
          let indexQuarter = this.student.career.pensum.indexOf(quarter);

          if (indexQuarter > -1){
              let index = this.student.career.pensum[indexQuarter].subjects.indexOf(subject);

              if (index > -1) {
                quarter.subjects.splice(index, 1);
                this.save();
              }
            }
    });
  }

  addSubjects(index: number): void {
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
       UIHelper.showMessage(this.alertCtrl, 'No asignaturas...',
        'No hay más asignaturas sin pre-requisitos que puedas tomar.');

       return;
    }

    let okButton = {
          text: 'OK',
          handler: data => {
            let _total = 0;
            let _subject : Subject = null;
            for (var idx = 0; idx < data.length; idx++) {
                try {
                    _subject = copySubjects[parseInt(data[idx])];
                    this.student.quarterList[index].subjects.push(_subject);
                    _total++;
                } catch (Error){
                    Logger.log("Error intentando agregar cuatrimestre " + data[idx] + ": " + Error.message);
                }
            }
            if (_total > 0) {
              if (_total == 1) {
                  UIHelper.showToast(this.toastCtrl, _subject.name + ' agregado!')
              } else {
                  UIHelper.showToast(this.toastCtrl, _total + " cuatrimestres agregado!");
              }
              this.save();
            }
          }
    };
    let buttons = ["Cancelar", okButton];

    UIHelper.newSubjectsModal(this.alertCtrl, copySubjects, buttons).present();
  }

  addQuarter(): void {
    if (this.student.quarterList.length < this.student.career.pensum.length) {
       let newQuarter = this.student.career.pensum[this.student.quarterList.length];
       newQuarter.subjects = this.getNotDuplicatedSubjects(newQuarter.subjects, this.student.quarterList);
       this.student.quarterList.push(newQuarter);

       this.save();

       UIHelper.showToast(this.toastCtrl, newQuarter.description + ' agregado!');
    }
  }

  removeQuarter(quarter: Quarter): void {
    let msg = '¿Esta usted seguro que quiere eliminar este cuatrimestre de su proyección?';

    UIHelper.showConfirm(this.alertCtrl, msg, () => {
        let index = this.student.quarterList.indexOf(quarter);

        if (index > -1)
        {
          this.student.quarterList.splice(index, 1);
          this.save();
        }
    });
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

  save() {
    Logger.log("here is student!!!!");
    Logger.log(this.student);
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
          Logger.log("I'm going to save...");
          Logger.log(data);
          return self.db.put(data);
        }).catch(function (err) {
          if (err.status == 409) {
            return self.save(); // Crazy, right?
          } else { // new data
          Logger.log("this is data..");
          Logger.log(data);
            return self.db.put(data);
          }
        });

        Logger.log("Guardado!");
    }
  }

  getProyection() {
      this.db.get("proyection").catch(function (err) {
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
       Logger.log("Error getting stored proyection: " + err);
    });
  }

}
