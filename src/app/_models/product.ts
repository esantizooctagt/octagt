import { Inventory } from './inventory';

export class Product {
    constructor (
        public Product_Id: string,
        public Company_Id: string,
        public SKU: string,
        public Name: string,
        public Unit_Price: number,
        public Img_Path: string,
        public Type: string,
        public Status: Number,
        public Stores: Inventory[],
        public Qty?: Number,
        public Category_Id?: string,
        public Img_Url?: string,
        public Unit?: Number
    ){}
}