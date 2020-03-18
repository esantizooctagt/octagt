import { Component, OnInit, ViewChild, Input, Output, ElementRef, EventEmitter } from '@angular/core';
import Cropper from "cropperjs";

@Component({
  selector: 'app-cropper',
  templateUrl: './cropper.component.html',
  styleUrls: ['./cropper.component.scss']
})
export class CropperComponent implements OnInit {
  @ViewChild("image")
  public imageElement: ElementRef;

  @Input("src")
  public imageSource: string;

  @Output() cropImage = new EventEmitter<string>();
  public imageDestination: string;
  private cropper: Cropper;

  constructor() { 
    this.imageDestination = "";
  }

  ngOnInit() {
  }

  public ngAfterViewInit() {
    this.cropper = new Cropper(this.imageElement.nativeElement, {
        zoomable: true,
        scalable: false,
        aspectRatio: 1,
        crop: () => {
            const canvas = this.cropper.getCroppedCanvas({width:200, height: 200});
            this.imageDestination = canvas.toDataURL("image/png");
            this.cropImage.emit(this.imageDestination);
        }
    });
  }

  setDragMode(){
    this.cropper.setDragMode('move');
  }

}
