export class Customers {
    constructor (
        public customers: [{
            Customer_Id: string,
            Name: string,
            Tax_Number: string,
        }]
    ){}
}