import { NgModule, ModuleWithProviders } from '@angular/core';

import { Viewer3DComponent } from './src/componets/viewer3D.component';

export * from './src/componets/viewer3D.component';

export const VIEWER_DIRECTIVES: any[] = [
    Viewer3DComponent
];

@NgModule({
    declarations: [
        ...VIEWER_DIRECTIVES
    ],
    exports: [
        ...VIEWER_DIRECTIVES
    ]
})
export class Editor3DModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: Editor3DModule
        };
    }
}
