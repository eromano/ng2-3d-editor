import { Component, Input } from '@angular/core';
import { EditorControls } from '../controllers/editorControls';

import * as THREE from 'three';
import * as ObjLoaderService from '../jsservice/objLoader.service';
import * as MtlLoaderService from '../jsservice/mtlLoader.service';

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

    inGenerate: boolean = false;
    viewer: any;

    container: any;
    stats: any;
    camera: any;
    scene: any;
    renderer: any;
    mouseX: number = 0;
    mouseY: number = 0;
    windowHalfY: any;
    windowHalfX: any;
    controllers: any;
    center: any = new THREE.Vector3();

    loading: boolean = true;
    detailLoading: string;

    ngOnInit() {
        console.log(ObjLoaderService);
        console.log(MtlLoaderService);
        this.container = document.getElementById('viewer-3d');

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera.position.z = 250;
        // scene
        this.scene = new THREE.Scene();

        this.lights();

        this.grid();

        this.axisHelper();

        this.load();

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        if (this.clearColor) {
            this.renderer.setClearColor(this.clearColor);
        }

        this.container.appendChild(this.renderer.domElement);

        this.animate();

        this.controllers = new EditorControls(this.container, this.camera);
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
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

    load() {
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

    loadObj(materials: any) {
        let objLoader = new THREE.OBJLoader();

        if (materials) {
            materials.preload();
            objLoader.setMaterials(materials);
        }

        this.setDetailLoad('OBJECTS');

        objLoader.load(this.urlFile, (object) => {
            this.loading = false;
            this.scene.add(object);

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
        this.renderer.render(this.scene, this.camera);
    }

    isLoading() {
        return this.loading;
    }
}
