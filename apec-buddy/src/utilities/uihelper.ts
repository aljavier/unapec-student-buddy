import { Subject } from '../models/subject'
import { AlertController, ToastController } from 'ionic-angular';
import { Calification } from '../enums/Calification';

export class UIHelper {

  static newSubjectsModal(alert: AlertController, subjects: Array<Subject>, buttons: Array<any>) {

    let inputs = Array<any>();

    for (var idx = 0; idx < subjects.length; idx++) {
        inputs.push({
            type: 'checkbox',
            label: subjects[idx].name,
            value: idx.toString(),
            checked: false
        });
    }

    return UIHelper.newInputModal(alert, 'Agregar asignaturas', buttons, inputs);
  }

  static newCalificationModal(alert: AlertController, subject: Subject, callback: (data: any) => void): any {

    let inputs = [{
      type: 'radio',
      label: 'A (90-100)',
      value: Calification[Calification.A],
      checked: (subject.calification == Calification.A)
    },
    {
      type: 'radio',
      label: 'B (80-89)',
      value: Calification[Calification.B],
      checked: (subject.calification == Calification.B)
    },
    {
      type: 'radio',
      label: 'C (70-79)',
      value: Calification[Calification.C],
      checked: (subject.calification == Calification.C)
    },
    {
      type: 'radio',
      label: 'D (60-69, Reprobado)',
      value: Calification[Calification.D],
      checked: (subject.calification == Calification.D)
    },
    {
      type: 'radio',
      label: 'F (0-59, Reprobado)',
      value: Calification[Calification.F],
      checked: (subject.calification == Calification.F)
    },
    {
      type: 'radio',
      label: 'Retirada',
      value: Calification[Calification.R],
      checked: (subject.calification == Calification.R)
    },
    {
      type: 'radio',
      label: 'Exonerada',
      value: Calification[Calification.E],
      checked: (subject.calification == Calification.E)
    },
    {
      type: 'radio',
      label: 'Convalidada',
      value: Calification[Calification.CO],
      checked: (subject.calification == Calification.CO)
    }];

    let buttons = ["Cancelar", {
      text: 'OK',
      handler: data => {
        callback(data);
      }
    }];

    return UIHelper.newInputModal(alert, 'Calificación', buttons, inputs);
  }

  static newInputModal(alert: AlertController, title: string,
    buttons: Array<any>, inputs: Array<any>) : any {

      let _alert = alert.create();
      _alert.setTitle(title);

      // Add buttons
      for (var idx = 0; idx < buttons.length; idx++) {
          _alert.addButton(buttons[idx]);
      }

      // Add inputs
      for (var idx = 0; idx < inputs.length; idx++) {
        _alert.addInput(inputs[idx]);
      }

      return _alert;
  }

  static showConfirm(alert: AlertController, message: string, callback: () => any) {
    let confirm = alert.create({
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

  static showToast(toast: ToastController, message: string, position: string = 'center') {
    toast.create({
      message: message,
      duration: 3*1000,
      position: position
    }).present();
  }

  static showMessage(alert: AlertController, title: string, message: string)
  {
     let confirm = alert.create({
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

}
