export class CustomerList {
    constructor (
        public pagesTotal: {
            page: number,
            pages: number,
            count: number
        },
        public customers: [{
            Customer_Id: string,
            Name: string,
            Phone: string,
            Tax_Number: string,
            Email: string
        }]
    ){}
}