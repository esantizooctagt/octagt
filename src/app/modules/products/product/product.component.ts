import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Product, Category } from '@app/_models';
import { FormBuilder, Validators } from '@angular/forms';
import { ProductService, CategoryService } from "@app/services";
import { AuthService } from '@core/services';
import { MonitorService } from "@shared/monitor.service";
import { NgxImageCompressService } from 'ngx-image-compress';
import { environment } from '@environments/environment';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { Subscription, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  @Input() product: Product;
  @ViewChild('uploadFile') fileDataText: ElementRef;

  get Name(){
    return this.productForm.get('Name');
  }

  get Unit_Price(){
    return this.productForm.get('Unit_Price');
  }

  get SKU(){
    return this.productForm.get('SKU');
  }

  get Type(){
    return this.productForm.get('Type')
  }

  get CategoryId(){
    return this.productForm.get('CategoryId');
  }

  readonly bucketURL = environment.bucket;
  message: string='';
  companyId: string='';
  subsProds: Subscription;
  message$: Observable<string>;
  product$: Observable<Product>;
  productSave$: Observable<any>;
  categories$: Observable<Category[]>;
  displayForm: boolean=true;
  savingProduct: boolean=false;
  pathImg: string='';

  //Variables to upload and display images
  fileString: any;
  imageSize = 0;
  file: any;

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private spinnerService: SpinnerService,
    private data: MonitorService,
    private dialog: MatDialog,
    private imageCompress: NgxImageCompressService
  ) { }

  productForm = this.fb.group({
    ProductId: [''],
    CompanyId: [''],
    Name: ['', [Validators.required, Validators.minLength(3)]],
    CategoryId: ['', Validators.required],
    SKU: ['',[Validators.minLength(3), Validators.min(1), Validators.max(999999999999999)]],
    Unit_Price: ['', [Validators.required, Validators.max(99999999.90), Validators.min(0.01), Validators.maxLength(11)]],
    File: [''],
    Type: ['goods', Validators.required],
    Status: [1]
  })
    
  selectFile(event: any) { 
    // var  fileName : any;
    this.fileString = null;

    this.file = event.target.files[0];
    //fileName = this.file['name'];
    if (event.target.files && event.target.files[0]){
      const reader: FileReader = new FileReader();
      this.pathImg = '';
      //this.productForm.controls.Name.markAsTouched();
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
            // console.warn('Size in bytes is now:', this.imageCompress.byteCount(compress));
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

  openDialog(header: string, message: string, success: boolean, error: boolean, warn: boolean): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: header, 
      message: message, 
      success: success, 
      error: error, 
      warn: warn
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';
    this.dialog.open(DialogComponent, dialogConfig);
  }

  ngOnInit() {
    this.companyId = this.authService.companyId();
    this.message$ = this.data.monitorMessage;
    this.categories$ = this.categoryService.getCategories(this.companyId);
    this.onValueChanges();
  }

  getErrorMessage(component: string) {
    if (component === 'Name'){
      return this.Name.hasError('required') ? 'You must enter a value' :
          this.Name.hasError('minlength') ? 'Minimun length 3' :
              '';
    }
    if (component === 'CategoryId'){
      return this.CategoryId.hasError('required') ? 'You must select a valid value' :
          '';
    }
    if (component === 'Unit_Price'){
      return this.Unit_Price.hasError('required') ? 'You must enter a value' :
          this.Unit_Price.hasError('min') ? 'Minimun value 0.01' :
            this.Unit_Price.hasError('max') ? 'Maximun value 99999999.90':
              this.Unit_Price.hasError('pattern') ? 'Incorrect value':
                '';
    }
    if (component === 'SKU'){
      return this.SKU.hasError('min') ? 'Minimun value 1' :
        this.SKU.hasError('max') ? 'Maximun value 999999999999999':
          this.SKU.hasError('minLength') ? 'Incorrect value':
            '';
    }
  }

  onValueChanges(): void {
    this.subsProds = this.productForm.valueChanges.subscribe(val=>{
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
      var spinnerRef = this.spinnerService.start("Loading Product...");
      let prodResult = changes.product.currentValue;
      this.fileDataText.nativeElement.value = '';
      this.productForm.reset({Status:1, Type:'goods', Name:'', CategoryId:'None', CompanyId:'', ProductId:'', Unit_Price:'', SKU:'', File:''});
      this.fileString = null;
      this.pathImg = '';

      this.product$ = this.productService.getProduct(prodResult.Product_Id).pipe(
        tap(res => {
          let linkValue;
          if (res != null) {
            this.productForm.setValue({
              ProductId: res.Product_Id,
              CompanyId: res.Company_Id,
              Name: res.Name,
              CategoryId: res.Category_Id,
              Unit_Price: res.Unit_Price,
              SKU: res.SKU,
              File: '',
              Type: res.Type,
              Status: res.Status
            });
            linkValue = res.Img_Url;
          }
          this.spinnerService.stop(spinnerRef);
          if (res.Img_Path != ''){
            // this.fileString = 'data:image/png;base64,'+res.Img_Path;
            this.pathImg = this.bucketURL+linkValue;
          }
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Error !', err.Message, false, true, false);
          return throwError(err || err.message);
        })
      );
    } else {
      this.productForm.reset({Status:1, Type:'goods', Name:'', CategoryId:'None', CompanyId:'', ProductId:'', Unit_Price:'', SKU:'', File:''});
    }
  }

  onSubmit(){
    // stop here if form is invalid
    if (this.productForm.invalid) {
      return;
    }
    if (this.productForm.touched){
      let productId = this.productForm.value.ProductId;
      var spinnerRef = this.spinnerService.start("Saving Product...");
      if (productId !== '' && productId !== null) {  
        let userId = this.authService.userId();
        const fd = new FormData();
        fd.append('File', this.fileString);
        fd.append('Img_Path', this.companyId+ '/img/products/');
        fd.append('Name', this.productForm.value.Name);
        fd.append('Unit_Price', this.productForm.value.Unit_Price);
        fd.append('SKU', this.productForm.value.SKU);
        fd.append('Type', this.productForm.value.Type);
        fd.append('Status', this.productForm.value.Status);
        fd.append('UserId', userId);
        fd.append('CategoryId', this.productForm.value.CategoryId);
        this.productSave$ = this.productService.updateProduct(productId, fd).pipe(
          tap(res => {
            this.savingProduct = true;
            this.spinnerService.stop(spinnerRef);
            this.fileString = null;
            this.pathImg = '';
            this.fileDataText.nativeElement.value = '';
            this.data.changeData('products');
            this.openDialog('Products', 'Product created successful', true, false, false);
            this.productForm.reset({Status:1, Type:'goods', Name:'', CategoryId:'None', CompanyId:'', ProductId:'', Unit_Price:'', SKU:'', File:''});
          }),
          catchError(err => {
            this.savingProduct = false;
            this.spinnerService.stop(spinnerRef);
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      } else {
        let userId = this.authService.userId();
        const fd = new FormData();
        // fd.append('File', this.fileData, this.fileData.name);
        fd.append('File', this.fileString);
        fd.append('CompanyId', this.companyId);
        fd.append('Name', this.productForm.value.Name);
        fd.append('Unit_Price', this.productForm.value.Unit_Price);
        fd.append('SKU', this.productForm.value.SKU);
        fd.append('Type', this.productForm.value.Type);
        fd.append('Status', this.productForm.value.Status);
        fd.append('UserId', userId);
        fd.append('CategoryId', this.productForm.value.CategoryId);
        this.productSave$ = this.productService.postProduct(fd).pipe(
          tap(res => {
            this.savingProduct = true;
            this.spinnerService.stop(spinnerRef);
            this.fileString = null;
            this.pathImg = '';
            this.fileDataText.nativeElement.value = '';
            this.data.changeData('products');
            this.openDialog('Products', 'Product created successful', true, false, false);
            this.productForm.reset({Status:1, Type:'goods', Name:'', CategoryId:'None', CompanyId:'', ProductId:'', Unit_Price:'', SKU:'', File:''});
          }),
          catchError(err => {
            this.savingProduct = false;
            this.spinnerService.stop(spinnerRef);
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      }
    }
  }

  onCancel(){
    this.fileDataText.nativeElement.value = '';
    this.productForm.reset({Status:1, Type:'goods', Name:'', CategoryId:'None', CompanyId:'', ProductId:'', Unit_Price:'', SKU:'', File:''});
    this.fileString = null;
    this.pathImg = '';
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

  ngOnDestroy() {
    this.subsProds.unsubscribe();
  }

}