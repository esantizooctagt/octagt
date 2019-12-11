import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Product } from '@app/_models';
import { FormBuilder, Validators } from '@angular/forms';
import { ProductService } from "@app/services";
import { AuthService } from '@core/services';
import { Router } from '@angular/router';
import { MonitorService } from "@shared/monitor.service";
import { AlertService  } from "@shared/alert";
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  @Input() product: Product;

  get Name(){
    return this.productForm.get('Name');
  }

  message: string='';
  submitted = false;
  companyId: string='';
  retrive = false;

  //Variables to upload and display images
  fileData: File = null;
  previewUrl: any = null;
  fileString: any;
  // fileUploadProgress: string = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private productService: ProductService,
    private router: Router,
    private data: MonitorService,
    private alertService: AlertService
  ) { }

  productForm = this.fb.group({
    Product_Id: [''],
    CompanyId: [''],
    Name: ['', [Validators.required, Validators.minLength(3)]],
    Unit_Price: [''],
    Unit_Cost: [''],
    Qty: [''],
    File: [''],
    Type: ['goods'],
    Status: [0]
  })

  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];
    this.preview();

    let reader = new FileReader();
      this.fileString = '';
      reader.readAsDataURL(this.fileData);
      reader.onload = (event:any) => {
        this.fileString = event.target.result;
      }
  }
  
  preview() {
    // Show preview 
    var mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    var reader = new FileReader();      
    reader.readAsDataURL(this.fileData); 
    reader.onload = (_event) => { 
      this.previewUrl = reader.result; 
    }
  }

  ngOnInit() {
    this.companyId = this.authService.companyId();  
    this.data.monitorMessage
        .subscribe((message: any) => {
          this.message = message;
        });
    this.onValueChanges();
  }

  onValueChanges(): void {
    this.productForm.valueChanges.subscribe(val=>{
      if (val.Status === true) {
        this.productForm.controls["Status"].setValue(1);
      }
      if (val.Status === false){
        this.productForm.controls["Status"].setValue(0);
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    this.retrive = true;
    if (changes.product.currentValue != undefined) {
      let res = changes.product.currentValue;
      this.productForm.setValue({
        Product_Id: res.Product_Id,
        Company_Id: res.Company_Id,
        Name: res.Name,
        Unit_Price: res.Unit_Price,
        Unit_Cost: res.Unit_Cost,
        Qty: res.Qty,
        Img_Path: res.Img_Path,
        Type: res.Type,
        Status: res.Status
      });
      this.previewUrl = 'http://localhost:3000/uploads/'+res.Img_Path.replace('uploads\\','');
    }
  }

  onSubmit(){
    let productId = this.productForm.value.Product_Id;
    let tokenValue = this.authService.currentToken();
    this.submitted = true;
    if (productId !== '' && productId !== null) {  
      const fd = new FormData();
      fd.append('File', this.fileData, this.fileData.name);
      fd.append('Name', this.productForm.value.Name);
      fd.append('Unit_Price', this.productForm.value.Unit_Price);
      fd.append('Unit_Cost', this.productForm.value.Unit_Cost);
      fd.append('Qty', this.productForm.value.Qty);
      fd.append('Type', this.productForm.value.Type);
      fd.append('Status', this.productForm.value.Status);

      this.productService.updateProduct(productId, tokenValue, fd)
        .subscribe(
          response =>  {
            this.submitted = false;
            this.productForm.reset({Status:0, Type:'goods'});
            this.fileData = null;
            this.preview = null;
            this.previewUrl = null;
            this.data.changeData('change');
            this.alertService.success('Product created successful');
          },
          error => { 
            this.alertService.error('Error ! ' + error);
          }
        );
    } else {
      const fd = new FormData();
      fd.append('File', this.fileString);
      fd.append('CompanyId', this.companyId);
      fd.append('Name', this.productForm.value.Name);
      fd.append('Unit_Price', this.productForm.value.Unit_Price);
      fd.append('Unit_Cost', this.productForm.value.Unit_Cost);
      fd.append('Qty', this.productForm.value.Qty);
      fd.append('Type', this.productForm.value.Type);
      fd.append('Status', this.productForm.value.Status);

      this.productService.postProduct(tokenValue, fd)
      .subscribe(
        response => {
          this.submitted = false;
          this.productForm.reset({Status:0, Type:'goods'});
          this.fileData = null;
          this.preview = null;
          this.previewUrl = null;
          this.data.changeData('change');
          this.alertService.success('Product updated successful');
        },
        error => { 
          this.alertService.error('Error ! ' + error);
        }
      );
      // fd.append('File', this.fileData, this.fileData.name);
    }
  }

  onCancel(){
    this.submitted = true;
    this.productForm.reset({Status:0, Type:'goods'});
    this.data.changeData('change');
    this.fileData = null;
    this.preview = null;
    this.previewUrl = null;
  }

}
