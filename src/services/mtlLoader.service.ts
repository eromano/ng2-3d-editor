/* porting three.js/examples/js/loaders/ */

import { Injectable } from '@angular/core';
import { MtlCreatorService } from './mtlCreator.service';
import * as THREE from 'three';

@Injectable()
export class MtlLoaderService {
    manager: any = THREE.DefaultLoadingManager;

    path: any;
    texturePath: any;
    crossOrigin: any;
    materialOptions: any;

    /**
     * Loads and parses a MTL asset from a URL.
     *
     * @param {String} url - URL to the MTL file.
     * @param {Function} [onLoad] - Callback invoked with the loaded object.
     * @param {Function} [onProgress] - Callback for download progress.
     * @param {Function} [onError] - Callback for download errors.
     *
     * @see setPath setTexturePath
     *
     * @note In order for relative texture references to resolve correctly
     * you must call setPath and/or setTexturePath explicitly prior to load.
     */
    load(url, onLoad, onProgress, onError) {
        let scope = this;

        let loader = new THREE.FileLoader(this.manager);
        loader.setPath(this.path);
        loader.load(url, function (text) {
            onLoad(scope.parse(text));

        }, onProgress, onError);
    }

    /**
     * Set base path for resolving references.
     * If set this path will be prepended to each loaded and found reference.
     *
     * @see setTexturePath
     * @param {String} path
     *
     * @example
     *     mtlLoader.setPath( 'assets/obj/' );
     *     mtlLoader.load( 'my.mtl', ... );
     */
    setPath(path) {
        this.path = path;
    }

    /**
     * Set base path for resolving texture references.
     * If set this path will be prepended found texture reference.
     * If not set and setPath is, it will be used as texture base path.
     *
     * @see setPath
     * @param {String} path
     *
     * @example
     *     mtlLoader.setPath( 'assets/obj/' );
     *     mtlLoader.setTexturePath( 'assets/textures/' );
     *     mtlLoader.load( 'my.mtl', ... );
     */
    setTexturePath(path) {
        this.texturePath = path;
    }

    setBaseUrl(path) {
        console.warn('THREE.MTLLoader: .setBaseUrl() is deprecated. Use .setTexturePath( path ) for texture path or .setPath( path ) for general base path instead.');

        this.setTexturePath(path);
    }

    setCrossOrigin(value) {
        this.crossOrigin = value;
    }

    setMaterialOptions(value) {
        this.materialOptions = value;
    }

    /**
     * Parses a MTL file.
     *
     * @param {String} text - Content of MTL file
     * @return {THREE.MTLLoader.MaterialCreator}
     *
     * @see setPath setTexturePath
     *
     * @note In order for relative texture references to resolve correctly
     * you must call setPath and/or setTexturePath explicitly prior to parse.
     */
    parse(text) {
        let lines = text.split('\n');
        let info = {};
        let delimiterPattern = /\s+/;
        let materialsInfo = {};

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            line = line.trim();

            if (line.length === 0 || line.charAt(0) === '#') {                // Blank line or comment ignore
                continue;

            }

            let pos = line.indexOf(' ');

            let key = ( pos >= 0 ) ? line.substring(0, pos) : line;
            key = key.toLowerCase();

            let value = ( pos >= 0 ) ? line.substring(pos + 1) : '';
            value = value.trim();

            if (key === 'newmtl') {                // New material
                info = {name: value};
                materialsInfo[value] = info;
            } else if (info) {
                if (key === 'ka' || key === 'kd' || key === 'ks') {
                    let ss = value.split(delimiterPattern, 3);
                    info[key] = [parseFloat(ss[0]), parseFloat(ss[1]), parseFloat(ss[2])];

                } else {
                    info[key] = value;

                }

            }

        }

        let materialCreator = new MtlCreatorService(this.texturePath || this.path, this.materialOptions);
        materialCreator.setCrossOrigin(this.crossOrigin);
        materialCreator.setManager(this.manager);
        materialCreator.setMaterials(materialsInfo);
        return materialCreator;
    }

}
