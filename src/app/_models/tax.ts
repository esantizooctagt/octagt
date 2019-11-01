export class Tax {
    constructor (
        public Tax_Id: string,
        public Company_Id: string,
        public Name: string,
        public Percentage: number,
        public Include_Tax: boolean,
        public Status: Number
    ){}
}