export class Inventory {
    constructor (
        public Store_Id: string,
        public Product_Id: string,
        public Qty: Number,
        public StoreName?: string,
    ){}
}