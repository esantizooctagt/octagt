export class Product {
    constructor (
        public Product_Id: string,
        public Company_Id: string,
        public Name: string,
        public Unit_Price: Number,
        public Unit_Cost: Number,
        public Qty: Number,
        public Img_Path: string,
        public Type: string,
        public Status: Number
    ){}
}