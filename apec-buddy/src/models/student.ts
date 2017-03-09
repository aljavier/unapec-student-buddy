import { School } from './school';
import { Quarter } from './quarter';
import { Career } from './career';

import { Calification } from '../../enums/Calification';

export class Student {
    
  school: School;
  career: Career;
  GPA: number = 0.00;
  quarterList =  Array<Quarter>(); // Cuatrimestres de la proyeccion del estudiante
  
  getGPA(): number {
    if (this.quarterList.length == 0) return 0.00;
    
    let points = 0.0;
    let credits = 0.0;
    for (let q of this.quarterList) {
      for (let s of q.subjects) {
        points += s.calification * s.credits;
        credits += s.credits;
      }
    }
      return points / credits;
  }
  
  getQuarterAvg(quarter: Quarter): number {
        let points = 0.0;
        let credits = 0.0;
        for (let s of quarter.subjects) {
            points += s.calification * s.credits;
            credits += s.credits;
        }

        return points / credits;
    }
    
}