import { Component, Input } from '@angular/core';
import { EditorControls } from '../controllers/editorControls';

import * as THREE from 'three';
import * as ObjLoaderService from '../jsservice/objLoader.service';
import * as MtlLoaderService from '../jsservice/mtlLoader.service';
import * as FBXLoaderService from '../jsservice/fbxLoader2.service';
let TransformControls = require('three-transformcontrols');

@Component({
    moduleId: module.id,
    selector: 'threed-viewer',
    templateUrl: './viewer3D.component.html',
    styleUrls: ['./viewer3D.component.css']
})
export class Viewer3DComponent {

    @Input()
    urlFile: string;

    @Input()
    clearColor: string;

    @Input()
    initialPositionCamera: any;

    @Input()
    initialRotationCamera: any;

    @Input()
    enableTransformController: any = true;

    inGenerate: boolean = false;

    container: any;
    camera: any;
    scene: any;
    renderer: any;
    mouseX: number = 0;
    mouseY: number = 0;
    windowHalfY: any;
    windowHalfX: any;
    controllers: EditorControls;
    transformControl: any;
    center: any = new THREE.Vector3();

    loading: boolean = true;
    detailLoading: string;

    ngOnInit() {
        console.log(ObjLoaderService);
        console.log(MtlLoaderService);
        console.log(FBXLoaderService);
        console.log(TransformControls);
        this.container = document.getElementById('viewer-3d');

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera.position.z = 250;
        // scene
        this.scene = new THREE.Scene();

        this.lights();

        this.grid();

        this.axisHelper();

        let extension = this.getFileExtension(this.urlFile);

        if (extension === 'obj') {
            this.loadObjFormatFile();
        } else if (extension === 'fbx') {
            this.loadFbxFormatFile();
        }

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        if (this.clearColor) {
            this.renderer.setClearColor(this.clearColor);
        }

        this.container.appendChild(this.renderer.domElement);

        this.animate();

        if (this.enableTransformController) {
            this.transformControl = new TransformControls(this.camera, this.renderer.domElement);
            this.transformControl.addEventListener('change', this.render.bind(this));
        }

        this.controllers = new EditorControls(this.container, this.camera);

        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        window.addEventListener('keydown', (event) => {
            switch (event.keyCode) {
                case 81: // Q
                    this.transformControl.setSpace(this.transformControl.space === 'local' ? 'world' : 'local');
                    break;
                case 17: // Ctrl
                    this.transformControl.setTranslationSnap(100);
                    this.transformControl.setRotationSnap(THREE.Math.degToRad(15));
                    break;
                case 87: // W
                    this.transformControl.setMode('translate');
                    break;
                case 69: // E
                    this.transformControl.setMode('rotate');
                    break;
                case 82: // R
                    this.transformControl.setMode('scale');
                    break;
                case 187:
                case 107: // +, =, num+
                    this.transformControl.setSize(this.transformControl.size + 0.1);
                    break;
                case 189:
                case 109: // -, _, num-
                    this.transformControl.setSize(Math.max(this.transformControl.size - 0.1, 0.1));
                    break;
                default:
                    break;
            }
        });

        window.addEventListener('keyup', (event) => {
            switch (event.keyCode) {
                case 17: // Ctrl
                    this.transformControl.setTranslationSnap(null);
                    this.transformControl.setRotationSnap(null);
                    break;
                default:
                    break;
            }
        });
    }

    lights() {
        let ambient = new THREE.AmbientLight(0x444444);

        let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();

        let helper = new THREE.DirectionalLightHelper(directionalLight, 5);

        this.scene.add(ambient);
        this.scene.add(helper);
        this.scene.add(directionalLight);
    }

    axisHelper() {
        let axisHelper = new THREE.AxisHelper(5);
        this.scene.add(axisHelper);
    }

    grid() {
        let lineMaterial = new THREE.LineBasicMaterial({color: 0x303030}),
            geometry = new THREE.Geometry(),
            floor = -75, step = 25;
        for (let i = 0; i <= 40; i++) {
            geometry.vertices.push(new THREE.Vector3(-500, floor, i * step - 500));
            geometry.vertices.push(new THREE.Vector3(500, floor, i * step - 500));
            geometry.vertices.push(new THREE.Vector3(i * step - 500, floor, -500));
            geometry.vertices.push(new THREE.Vector3(i * step - 500, floor, 500));
        }
        let line = new THREE.LineSegments(geometry, lineMaterial);
        this.scene.add(line);
    }

    loadObjFormatFile() {
        let mtlLoader = new THREE.MTLLoader();

        this.setDetailLoad('MATERIALS');

        mtlLoader.load(this.urlFile.replace('.obj', '.mtl'), (materials) => {
            this.loadObj(materials);
        }, (progress) => {
            console.log('progress material loader' + JSON.stringify(progress));
        }, (error) => {
            console.log('error material loader' + error);
            this.loadObj(null);
        });
    }

    loadFbxFormatFile() {
        this.setDetailLoad('FBX OBJECTS');

        let manager = new THREE.LoadingManager();
        manager.onProgress = function (item, loaded, total) {
            console.log(item, loaded, total);
        };

        let loader = new THREE.FBXLoader(manager);
        loader.load(this.urlFile, (object) => {
            this.loading = false;

            object.mixer = new THREE.AnimationMixer(object);
            let action = object.mixer.clipAction(object.animations[0]);
            action.play();
            this.scene.add(object);

            if (this.enableTransformController) {
                this.transformControl.attach(object);
                this.scene.add(this.transformControl);
            }

        }, (progress) => {
            console.log('progress fbx loader' + JSON.stringify(progress));
        }, (error) => {
            console.log('error' + error);
        });
    }

    loadObj(materials: any) {
        let objLoader = new THREE.OBJLoader();

        if (materials) {
            materials.preload();
            objLoader.setMaterials(materials);
        }

        this.setDetailLoad('OBJ OBJECTS');

        objLoader.load(this.urlFile, (object) => {
            this.loading = false;
            this.scene.add(object);

            if (this.enableTransformController) {
                this.transformControl.attach(object);
                this.scene.add(this.transformControl);
            }

            this.cameraPositioning();

        }, (progress) => {
            console.log('progress obj loader' + JSON.stringify(progress));
        }, (error) => {
            console.log('error' + error);
        });
    }

    cameraPositioning() {
        if (this.initialPositionCamera) {
            this.camera.position.set(this.initialPositionCamera.x, this.initialPositionCamera.y, this.initialPositionCamera.z);
        }

        if (this.initialRotationCamera) {
            this.camera.rotation.set(this.initialRotationCamera.x, this.initialRotationCamera.y, this.initialRotationCamera.z);
        }

        this.camera.lookAt(this.center);
    }

    private setDetailLoad(detail) {
        this.detailLoading = detail;
    };

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }

    onWindowResize() {
        this.windowHalfX = this.container.offsetWidth / 2;
        this.windowHalfY = this.container.offsetHeight / 2;
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }

    render() {
        if (this.transformControl) {
            this.transformControl.update();
        }
        this.renderer.render(this.scene, this.camera);
    }

    isLoading() {
        return this.loading;
    }

    getFileExtension(fileName: string) {
        return fileName.split('.').pop().toLowerCase();
    }
}
