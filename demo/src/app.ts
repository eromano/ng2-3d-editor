//our root app component
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Editor3DModule } from 'ng2-3d-editor';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'my-app',
  template: `
     <threed-viewer [initialRotationCamera]="initialRotationCamera" [initialPositionCamera]="initialPositionCamera" [urlFile]="'https://cdn.rawgit.com/eromano/ng2-3d-editor/master/examples/obj/car/car.obj'" [clearColor]="clearColor"></threed-viewer>
  `,
})
export class App {
  initialPositionCamera:any;
  initialRotationCamera:any;
  clearColor:any;

  constructor() {
   this.initialRotationCamera = {x: -0.3569454377164346, y: 0.8226385481329694, z: 0.2668119404891661};
   this.initialPositionCamera =  {x: 14.95050234828009, y: 4.848633256815587, z: 13.0018215134665};
   this.clearColor = 0xf0f0f0;
   console.log('start');
  }
}

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    Editor3DModule.forRoot()
  ],
  declarations: [ App ],
  bootstrap: [ App ]
})
export class AppModule {}
