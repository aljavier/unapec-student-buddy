import { School } from './school';
import { Quarter } from './quarter';
import { Career } from './career';

import { Calification } from '../../enums/Calification';

export class Student {
  _id: string = "";
  school: School;
  career: Career;
  GPA: number = 0.00;
  quarterList =  Array<Quarter>(); // Cuatrimestres de la proyeccion del estudiante
  
  getGPA(): number {
    
    var values = this.getPointsAndCredits(-1);
    
    return values[0] / values[1]; // puntos / creditos
  }
  
  getQuarterAvg(index: number): number {
    
        var values = this.getPointsAndCredits(index);

        return values[0] / values[1]; // puntos / creditos
    }
    
    getPointsAndCredits(index: number): Array<number> {
      
        if (this.quarterList.length == 0) 
            return [0.00, 1];
        
        let points = 0.0;
        let credits = 0.0;
        
        for (let idx = 0; idx < this.quarterList.length; idx++) {
            let subjects = (index > -1) ? this.quarterList[index].subjects : this.quarterList[idx].subjects;
            
            for (let s of subjects) {
              points += s.calification * s.credits;
              credits += s.credits;
            }
            if ((index > -1) && (idx == index)) return [points, credits];
        }
        return [points, credits];
    }
    
}