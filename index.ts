import { NgModule, ModuleWithProviders } from '@angular/core';

import { Viewer3DComponent } from './src/components/viewer3D.component';
import { CommonModule } from '@angular/common';

export * from './src/components/viewer3D.component';

export const VIEWER_DIRECTIVES: any[] = [
    Viewer3DComponent
];

@NgModule({
    imports: [
        CommonModule
    ],
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
