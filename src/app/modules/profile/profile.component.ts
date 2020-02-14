import { Component, OnInit } from '@angular/core';
import { User, Store } from '@app/_models';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxImageCompressService } from 'ngx-image-compress';
import { UsersService } from "@app/services";
import { AuthService } from '@core/services';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { StoresService } from '@app/services/stores.service';
import { ConfirmValidParentMatcher } from '@app/validators';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  stores: Store[]=[];
  companyId: string = '';
  userId: string = '';
  fileName: string= '';
  fileString: any;
  loading: boolean=false;
  readonly imgPath = environment.bucket;

  get f(){
    return this.profileForm.controls;
  }

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private authService: AuthService,
    private storeService: StoresService,
    private usersService: UsersService,
    private imageCompress: NgxImageCompressService
  ) { }

  profileForm = this.fb.group({
    Email: [''],
    User_Name: [''],
    First_Name: [''],
    Last_Name: [''],
    Avatar: [''],
    Company_Name: [''],
    StoreId: [''],
    Password: ['']
  })

  avatarForm = this.fb.group({
    Avatar: [null, Validators.required]
  });

  ngOnInit() {
    this.companyId = this.authService.companyId();
    this.userId = this.authService.userId();
    this.loading = true;
    this.storeService.getStores(this.companyId).subscribe((res: any) => {
      if (res != null){
        this.stores = res;
      }
    },
    error => {
      this.openDialog('Error !', error.Message, false, true, false);
    });
    this.usersService.getUser(this.userId).subscribe((res: any) => {
      if (res != null){
        this.profileForm.setValue({
          Email: res.Email,
          User_Name: res.User_Name,
          First_Name: res.First_Name,
          Last_Name: res.Last_Name,
          Avatar: res.Avatar,
          Company_Name: res.Company_Name,
          StoreId: res.Store_Id,
          Password: res.Password
        });
        this.loading = false;
      }
    },
    error => {
      this.loading = false;
      this.openDialog('Error !', error.Message, false, true, false);
    });
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

  getErrorMessage(component: string) {
    if (component === 'First_Name'){
      return this.f.First_Name.hasError('required') ? 'You must enter a value' :
          this.f.First_Name.hasError('minlength') ? 'Minimun length 3' :
            this.f.First_Name.hasError('maxlength') ? 'Maximun length 100' :
              '';
    }
    if (component === 'Last_Name'){
      return this.f.Last_Name.hasError('required') ? 'You must enter a value' :
          this.f.Last_Name.hasError('minlength') ? 'Minimun length 3' :
            this.f.Last_Name.hasError('maxlength') ? 'Maximun length 100' :
              '';
    }
  }

  onClick(){
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      if (file === undefined) {return;}
      this.fileName = file['name'];
      if (file['type'] != "image/png" && file['type'] != "image/jpg" && file['type'] != "image/jpeg") { 
        this.openDialog('User', 'File extension not allowed', false, true, false);
        return; 
      }
      
      const reader: FileReader = new FileReader();
      reader.onload = (event: Event) => {
        let dimX = 75;
        let dimY = 75;
        if (file['size'] > 60000){
          this.openDialog('User', 'File exced maximun allowed', false, true, false);
          return;
        }
        this.imageCompress.compressFile(reader.result, -1, dimX, dimY).then(
          compress => {
            // console.warn('Size in bytes is now:', this.imageCompress.byteCount(compress));
            this.fileString = compress;
            this.onSubmitAvatar();
          }
        );
      }
      reader.readAsDataURL(fileUpload.files[0]);
    };
    fileUpload.click();
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

  onSubmit(){
    if (this.profileForm.invalid){
      return;
    }
    this.loading = true;
    let dataForm =  { 
      "First_Name": this.profileForm.value.First_Name,
      "Last_Name": this.profileForm.value.Last_Name,
      "StoreId": this.profileForm.value.StoreId
    }
    this.usersService.updateUser(this.userId, dataForm)
      .subscribe(
      response =>  {
        this.loading = false;
        this.openDialog('User', 'User updated successful', true, false, false);
      },
      error => { 
        this.loading = false;
        this.openDialog('Error !', error.Message, false, true, false);
      });
  }

  onSubmitAvatar() {
    const formData: FormData = new FormData();
    this.loading = true
    formData.append('Image', this.fileString);
    let type: string ='';
    if (this.fileString.toString().indexOf('data:image/') >= 0){
      type = this.fileString.toString().substring(11,15);
    }
    if (type === 'jpeg' || type === 'jpg;'){
      type = '.jpg';
    }
    if (type === 'png;'){
      type = '.png';
    }
    this.usersService.uploadImage(this.userId, formData)
        .subscribe(
          response =>  {
            this.loading = false;
            this.profileForm.patchValue({'Avatar': this.companyId+'/img/avatars/'+this.userId+type});
            this.authService.setUserAvatar(this.companyId+'/img/avatars/'+this.userId+type);
            this.openDialog('User', 'Avatar uploaded successful', true, false, false);
            this.avatarForm.reset({'Avatar':null});
            this.fileString = null;
          },
          error => { 
            this.loading = false;
            this.openDialog('Error !', error.Message, false, true, false);
          }
        );
  }

}
