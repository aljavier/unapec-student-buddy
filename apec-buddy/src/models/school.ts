import { Career } from './career';

export class School {
    _id: string = "";
    code: string;
    name: string;
    careers: Array<Career>
}