/* porting three.js/examples/js/loaders/ */

import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class MtlCreatorService {
    /**
     * Create a new THREE-MTLLoader.MaterialCreator
     * @param baseUrl - Url relative to which textures are loaded
     * @param options - Set of options on how to construct the materials
     *                  side: Which side to apply the material
     *                        THREE.FrontSide (default), THREE.BackSide, THREE.DoubleSide
     *                  wrap: What type of wrapping to apply for textures
     *                        THREE.RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
     *                  normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
     *                                Default: false, assumed to be already normalized
     *                  ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
     *                                  Default: false
     * @constructor
     */
    baseUrl: any;
    options: any;
    materialsInfo: any = {};
    materials: any = {};
    materialsArray: any = [];
    nameLookup: any = {};
    side: any;
    wrap: any;
    manager: any;
    url: any;
    crossOrigin: any;

    constructor(baseUrl, options) {
        this.baseUrl = baseUrl || '';
        this.options = options;

        this.side = ( this.options && this.options.side ) ? this.options.side : THREE.FrontSide;
        this.wrap = ( this.options && this.options.wrap ) ? this.options.wrap : THREE.RepeatWrapping;
    }

    setCrossOrigin(value) {
        this.crossOrigin = value;
    }

    setManager(value) {
        this.manager = value;
    }

    setMaterials(materialsInfo) {
        this.materialsInfo = this.convert(materialsInfo);
        this.materials = {};
        this.materialsArray = [];
        this.nameLookup = {};
    }

    convert(materialsInfo) {
        if (!this.options) {
            return materialsInfo;
        }

        let converted = {};

        for (let mn in materialsInfo) {            // Convert materials info into normalized form based on options
            if (materialsInfo.hasOwnProperty(mn)) {

                let mat = materialsInfo[mn];

                let covmat = {};

                converted[mn] = covmat;

                for (let prop in mat) {
                    if (prop.hasOwnProperty(mat)) {
                        let save = true;
                        let value = mat[prop];
                        let lprop = prop.toLowerCase();

                        switch (lprop) {
                            case 'kd':
                            case 'ka':
                            case 'ks':

                                // Diffuse color (color under white light) using RGB values

                                if (this.options && this.options.normalizeRGB) {
                                    value = [value[0] / 255, value[1] / 255, value[2] / 255];

                                }

                                if (this.options && this.options.ignoreZeroRGBs) {
                                    if (value[0] === 0 && value[1] === 0 && value[2] === 0) {                                // ignore

                                        save = false;

                                    }

                                }

                                break;

                            default:

                                break;
                        }

                        if (save) {
                            covmat[lprop] = value;

                        }
                    }
                }
            }
        }

        return converted;

    }

    preload() {
        for (let mn in this.materialsInfo) {
            if (this.materialsInfo.hasOwnProperty(mn)) {
                this.create(mn);
            }
        }
    }

    getIndex(materialName) {
        return this.nameLookup[materialName];
    }

    getAsArray() {
        let index = 0;

        for (let mn in this.materialsInfo) {
            if (this.materialsInfo.hasOwnProperty(mn)) {
                this.materialsArray[index] = this.create(mn);
                this.nameLookup[mn] = index;
                index++;
            }
        }

        return this.materialsArray;
    }

    create(materialName) {
        if (this.materials[materialName] === undefined) {
            this.createMaterial_(materialName);

        }

        return this.materials[materialName];
    }

    createMaterial_(materialName) {        // Create material

        let scope = this;
        let mat = this.materialsInfo[materialName];
        let params: any = {
            name: materialName,
            side: this.side
        };

        let resolveURL = function (baseUrl, url) {
            if (typeof url !== 'string' || url === '') {
                return '';
            }

            // Absolute URL
            if (/^https?:\/\//i.test(url)) {
                return url;
            }

            return baseUrl + url;
        };

        function setMapForType(mapType, value) {
            if (params[mapType]) {
                return;
            } // Keep the first encountered texture

            let texParams: any = scope.getTextureParams(value, params);
            let map = scope.loadTexture(resolveURL(scope.baseUrl, texParams.url), null, null, null, null);

            map.repeat.copy(texParams.scale);
            map.offset.copy(texParams.offset);

            map.wrapS = scope.wrap;
            map.wrapT = scope.wrap;

            params[mapType] = map;
        }

        for (let prop in mat) {
            if (prop.hasOwnProperty(mat)) {
                let value = mat[prop];

                if (value === '') {
                    continue;
                }

                switch (prop.toLowerCase()) {                // Ns is material specular exponent

                    case 'kd':
                        // Diffuse color (color under white light) using RGB values
                        params.color = new THREE.Color().fromArray(value);
                        break;

                    case 'ks':
                        // Specular color (color when light is reflected from shiny surface) using RGB values
                        params.spresolveURLcular = new THREE.Color().fromArray(value);
                        break;

                    case 'map_kd':
                        // Diffuse texture map
                        setMapForType('map', value);
                        break;

                    case 'map_ks':
                        // Specular map
                        setMapForType('specularMap', value);
                        break;

                    case 'map_bump':
                    case 'bump':
                        // Bump texture map
                        setMapForType('bumpMap', value);
                        break;

                    case 'ns':
                        // The specular exponent (defines the focus of the specular highlight)
                        // A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.
                        params.shininess = parseFloat(value);
                        break;

                    case 'd':
                        if (value < 1) {
                            params.opacity = value;
                            params.transparent = true;

                        }
                        break;

                    case 'Tr':
                        if (value > 0) {
                            params.opacity = 1 - value;
                            params.transparent = true;

                        }
                        break;

                    default:
                        break;
                }
            }
        }

        this.materials[materialName] = new THREE.MeshPhongMaterial(params);
        return this.materials[materialName];
    }

    getTextureParams(value, matParams) {
        let texParams: any = {
            scale: new THREE.Vector2(1, 1),
            offset: new THREE.Vector2(0, 0)
        };

        let items = value.split(/\s+/);
        let pos;

        pos = items.indexOf('-bm');
        if (pos >= 0) {
            matParams.bumpScale = parseFloat(items[pos + 1]);
            items.splice(pos, 2);

        }

        pos = items.indexOf('-s');
        if (pos >= 0) {
            texParams.scale.set(parseFloat(items[pos + 1]), parseFloat(items[pos + 2]));
            items.splice(pos, 4); // we expect 3 parameters here!

        }

        pos = items.indexOf('-o');
        if (pos >= 0) {
            texParams.offset.set(parseFloat(items[pos + 1]), parseFloat(items[pos + 2]));
            items.splice(pos, 4); // we expect 3 parameters here!

        }

        texParams.url = items.join(' ').trim();
        return texParams;
    }

    loadTexture(url, mapping, onLoad, onProgress, onError) {
        let texture;
        let loader = THREE.Loader.Handlers.get(url);
        let manager = ( this.manager !== undefined ) ? this.manager : THREE.DefaultLoadingManager;

        if (loader === null) {
            loader = new THREE.TextureLoader(manager);

        }

        if (loader.setCrossOrigin) {
            loader.setCrossOrigin(this.crossOrigin);
        }
        texture = loader.load(url, onLoad, onProgress, onError);

        if (mapping) {
            texture.mapping = mapping;
        }

        return texture;
    }
}
