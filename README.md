# 3D File Editor Component for Angular 2

![DataTable demo](assets/ScreenShot1.png)

#### Basic usage with urlFile

```html
<threed-viewer  [overlayMode]="true" [urlFile]="'filename.pdf'"></threed-viewer>
```

Example of an App that declares the file viewer component :

```ts
import { NgModule, Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Editor3DComponent } from 'ng2-3d-editor';

@Component({
    selector: 'app-demo',
    template: `<threed-viewer  [showViewer]="true" [overlayMode]="true" [urlFile]="'localTestFile.obj'">
               </threed-viewer >`
})
class MyDemoApp {

}

@NgModule({
    imports: [
        BrowserModule,
        CoreModule.forRoot(),
        ViewerModule.forRoot()
    ],
    declarations: [ MyDemoApp ],
    bootstrap:    [ MyDemoApp ]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
```

#### Options

Attribute     | Options     | Default      | Description | Mandatory
---           | ---         | ---          | ---         | ---
`fileNodeId`         | *string*    |        |  node Id of the file to load the file | 
`urlFile`         | *string*    |        |  If you want laod an external file that not comes from the ECM you can use this Url where to load the file | 
`overlayMode`         | *boolean*    | `false`        | if true Show the Viewer full page over the present content otherwise will fit the parent div  |
`showViewer`         | *boolean*    | `true`        | Hide or show the viewer |

#### Supported file formats

Type     | extensions     
---           | ---         
3D         | OBJ


## Build from sources

Alternatively you can build component from sources with the following commands:


```sh
npm install
npm run build
```

### Build the files and keep watching for changes

```sh
$ npm run build:w
```

## Running unit tests

```sh
npm test
```

### Running unit tests in browser

```sh
npm test-browser
```

This task rebuilds all the code, runs tslint, license checks and other quality check tools
before performing unit testing.

### Code coverage

```sh
npm run coverage
```

## Demo

If you want have a demo of how the component works, please check the demo folder :

```sh
cd demo
npm install
npm start
```

## NPM scripts

| Command | Description |
| --- | --- |
| npm run build | Build component |
| npm run build:w | Build component and keep watching the changes |
| npm run test | Run unit tests in the console |
| npm run test-browser | Run unit tests in the browser
| npm run coverage | Run unit tests and display code coverage report |

## License

[Apache Version 2.0]
