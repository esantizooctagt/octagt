export class Document {
    constructor (
        public DocumentId: string,
        public StoreId: string,
        public Name: string,
        public Prefix: string,
        public Next_Number: number,
        public Digits_Qty: number,
        public Sufix: string,
        public Type: string,
        public Status: number,
        public CompanyId?: string
    ){}
}