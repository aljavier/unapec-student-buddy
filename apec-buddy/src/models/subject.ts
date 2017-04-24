import { Calification } from '../enums/Calification';

export class Subject {
    _id: string = "";
    code: string;
    name: string;
    credits: number;
    pre_requisits: string;
    calification: Calification = Calification.A;
}