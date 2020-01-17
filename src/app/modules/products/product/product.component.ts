import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Product } from '@app/_models';
import { FormBuilder, Validators } from '@angular/forms';
import { ProductService } from "@app/services";
import { AuthService } from '@core/services';
import { Router } from '@angular/router';
import { MonitorService } from "@shared/monitor.service";
import { AlertService  } from "@shared/alert";
import { NgxImageCompressService } from 'ngx-image-compress';
import { environment } from '@environments/environment';
// import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  @Input() product: Product;

  get Name(){
    return this.productForm.get('Name');
  }

  get Unit_Price(){
    return this.productForm.get('Unit_Price');
  }

  get Unit_Cost() {
    return this.productForm.get('Unit_Cost');
  }

  get Qty(){
    return this.productForm.get('Qty');
  }

  get Type(){
    return this.productForm.get('Type')
  }

  message: string='';
  submitted = false;
  loading = false;
  companyId: string='';
  readonly bucketURL = environment.bucket;

  //Variables to upload and display images
  fileString: any;
  imageSize = 0;
  file: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private productService: ProductService,
    private router: Router,
    private data: MonitorService,
    private alertService: AlertService,
    private imageCompress: NgxImageCompressService
  ) { }

  productForm = this.fb.group({
    ProductId: [''],
    CompanyId: [''],
    Name: ['', [Validators.required, Validators.minLength(3)]],
    Unit_Price: ['', [Validators.required, Validators.max(99999999.90), Validators.min(0.01), Validators.maxLength(11)]],
    Unit_Cost: ['', [Validators.required, Validators.max(99999999.9990), Validators.min(0.0001), Validators.maxLength(13)]],
    Qty: ['', [Validators.required, Validators.max(99999999.9990), Validators.min(0.0001), Validators.maxLength(13)]],
    File: [''],
    Type: ['goods', Validators.required],
    Status: [1]
  })
    
  selectFile(event: any) { 
    var  fileName : any;
    this.fileString = null;

    this.file = event.target.files[0];
    fileName = this.file['name'];
    if (event.target.files && event.target.files[0]){
      const reader: FileReader = new FileReader();
      reader.onload = (event: Event) => {
        this.imageSize = this.file['size'];
        let dimX;
        let dimY;
        if (this.imageSize > 500000) {
          dimX = 20;
          dimY = 20;
        } else {
          dimX = 75;
          dimY = 75;
        }
        this.imageCompress.compressFile(reader.result, -1, dimX, dimY).then(
          compress => {
            console.warn('Size in bytes is now:', this.imageCompress.byteCount(compress));
            this.fileString = compress;
          }
        );
      }
      reader.readAsDataURL(event.target.files[0]);
    }
    // this.imageCompress.uploadFile().then(({image, orientation}) => {
    //   this.imageSize = this.imageCompress.byteCount(image);
    //   let dimX;
    //   let dimY;
    //   if (this.imageSize > 500000){
    //     dimX = 20;
    //     dimY = 20;
    //   } else {
    //     dimX = 75;
    //     dimY = 75;
    //   }
    //   this.imageCompress.compressFile(image, orientation, dimX, dimY).then(
    //     compress => {
    //       console.warn('Size in bytes is now:', this.imageCompress.byteCount(compress));
    //       this.fileString = compress;
    //     }
    //   );
    // });
  }

  dataURItoBlob(dataURI, dataType) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: dataType });    
    return blob;
 }
  
  loadCropImage($event){
    this.fileString = $event;
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
    if (changes.product.currentValue != undefined) {
      let prodResult = changes.product.currentValue;
      this.productForm.reset({Status:1, Type:'goods', Name:'', CompanyId:'', ProductId:'', Unit_Price:'', Unit_Cost:'', Qty:'', File:''});
      this.fileString = null;
      this.productService.getProduct(prodResult.Product_Id).subscribe((res: any) => {
        if (res != null) {
          this.productForm.setValue({
            ProductId: res.Product_Id,
            CompanyId: res.Company_Id,
            Name: res.Name,
            Unit_Price: res.Unit_Price,
            Unit_Cost: res.Unit_Cost,
            Qty: res.Qty,
            File: '',
            Type: res.Type,
            Status: res.Status
          });
          // this.productForm.markAsPending();
          if (res.Img_Path != ''){
            this.fileString = 'data:image/png;base64,'+res.Img_Path;
          }
        }
      },
      error => { 
        this.alertService.error('Error ! ' + error.Message);
      });
    }
  }

  onSubmit(){
    // stop here if form is invalid
    if (this.productForm.invalid) {
      return;
    }
    let productId = this.productForm.value.ProductId;
    this.submitted = true;
    this.loading = true;
    if (productId !== '' && productId !== null) {  
      const fd = new FormData();
      fd.append('File', this.fileString);
      fd.append('Img_Path', this.companyId+ '/img/products/');
      fd.append('Name', this.productForm.value.Name);
      fd.append('Unit_Price', this.productForm.value.Unit_Price);
      fd.append('Unit_Cost', this.productForm.value.Unit_Cost);
      fd.append('Qty', this.productForm.value.Qty);
      fd.append('Type', this.productForm.value.Type);
      fd.append('Status', this.productForm.value.Status);
      this.productService.updateProduct(productId, fd)
        .subscribe(
          response =>  {
            this.alertService.success('Product created successful');
            this.submitted = false;
            this.loading = false;
            this.productForm.reset({Status:1, Type:'goods', Name:'', CompanyId:'', ProductId:'', Unit_Price:'', Unit_Cost:'', Qty:'', File:''});
            this.fileString = null;
            this.data.changeData('products');
          },
          error => { 
            this.loading = false;
            this.alertService.error('Error ! ' + error.Message);
          }
        );
    } else {
      const fd = new FormData();
      // fd.append('File', this.fileData, this.fileData.name);
      fd.append('File', this.fileString);
      fd.append('CompanyId', this.companyId);
      fd.append('Name', this.productForm.value.Name);
      fd.append('Unit_Price', this.productForm.value.Unit_Price);
      fd.append('Unit_Cost', this.productForm.value.Unit_Cost);
      fd.append('Qty', this.productForm.value.Qty);
      fd.append('Type', this.productForm.value.Type);
      fd.append('Status', this.productForm.value.Status);
      this.productService.postProduct(fd)
      .subscribe(
        response => {
          this.alertService.success('Product updated successful');
          this.submitted = false;
          this.loading = false;
          this.productForm.reset({Status:1, Type:'goods', Name:'', CompanyId:'', ProductId:'', Unit_Price:'', Unit_Cost:'', Qty:'', File:''});
          this.fileString = null;
          this.data.changeData('products');
        },
        error => { 
          this.loading = false;
          this.alertService.error('Error ! ' + error.Message);
        }
      );
    }
  }

  onCancel(){
    this.submitted = true;
    this.productForm.reset({Status:1, Type:'goods', Name:'', CompanyId:'', ProductId:'', Unit_Price:'', Unit_Cost:'', Qty:'', File:''});
    this.data.changeData('products');
    this.fileString = null;
  }

  changeType(e) {
    this.productForm.get('Type').setValue(e.target.value, {
       onlySelf: true
    })
  }

  public handleError = (controlName: string, errorName: string) => {
    return this.productForm.controls[controlName].hasError(errorName);
  }

  // allow only digits and dot
  onKeyPress(event, value): boolean { 
    const charCode = (event.which) ? event.which : event.keyCode;
    let perc: string = value.toString();
    var count = (perc.match(/[.]/g) || []).length;
    if (count  == 1) {
      if (charCode == 46) return false;
    }
    if (charCode == 46) return true;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

}
//FileReader
  //fileInput: any
    // this.fileString = '';
    // this.fileData = <File>fileInput.target.files[0];

    // var mimeType = this.fileData.type;
    // if (mimeType.match(/image\/*/) == null) {
    //   return;
    // }

    // let reader = new FileReader();
    // reader.readAsDataURL(this.fileData);
    // reader.onload = (_event) => {
    //   this.fileString = reader.result;
    //  }
// const imageType = fileTemp.split(';')[0].replace('data:','');
// const imageBlob = this.dataURItoBlob(fileTemp.replace('data:image/jpeg;base64,','').replace('data:image/png;base64,','').replace('data:image/jpg;base64,',''));
// const imageFile = new File([imageBlob], 'image-temp.'+imageType.split('/')[1], { type: imageType });
// console.log('Print File');
// console.warn(imageFile);
// let reader = new FileReader();
// reader.readAsDataURL(imageFile);
// reader.onload = (_event) => { 
//   this.fileString = reader.result;
//   console.log('Re converted file');
//   console.log(this.fileString);
// }