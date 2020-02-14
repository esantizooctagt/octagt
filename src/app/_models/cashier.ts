export class Cashier {
    constructor (
        public CashierId: string,
        public StoreId: string,
        public CompanyId: string,
        public Description: string,
        public Status: number,
        public Cashier_No?: number
    ){}
}