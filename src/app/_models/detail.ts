export class Detail {
    constructor (
        public Invoice_Id: string,
        public Line_No: Number,
        public Product_Id: string,
        public Company_Id: string,
        public Name: string,
        public Tax_Id: string,
        public Tax_Name: string,
        public Percetange: Number,
        public Include_Tax: Number,
        public Unit_Price: Number,
        public Qty: Number,
        public ToGo: Number,
        public Discount: Number,
        public Total: number,
        public Delivery_Date: Date
    ){}
}