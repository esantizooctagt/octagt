export class Product {
    constructor (
        public Product_Id: string,
        public Company_Id: string,
        public Name: string,
        public Unit_Price: number,
        public Qty: number,
        public Img_Path: string,
        public Type: string,
        public Status: Number,
        public Category_Id?: string,
        public Img_Url?: string
    ){}
}