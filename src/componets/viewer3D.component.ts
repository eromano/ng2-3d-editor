import { Component, Input } from '@angular/core';
import { ObjLoaderService } from '../services/objLoader.service';
import { DdsLoaderService } from '../services/ddsLoader.service';
import { MtlLoaderService } from '../services/mtlLoader.service';
import { EditorControls } from '../controllers/editorControls';

import * as THREE from 'three';

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
    nameFile: string;

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
    dragControls: any;

    loading: boolean = true;
    detailLoading: string;

    ngOnInit() {
        this.container = document.getElementById('viewer-3d');

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera.position.z = 250;
        // scene
        this.scene = new THREE.Scene();

        let ambient = new THREE.AmbientLight(0x444444);
        this.scene.add(ambient);
        let directionalLight = new THREE.DirectionalLight(0xffeedd);
        directionalLight.position.set(0, 0, 1).normalize();
        this.scene.add(directionalLight);

        THREE.Loader.Handlers.add(/\.dds$/i, new DdsLoaderService());

        this.grid();

        this.axisHelper();

        this.loadObj();

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        this.animate();

        this.controllers = new EditorControls(this.container, this.camera);
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
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

    loadObj() {
        let mtlLoader = new MtlLoaderService();

        this.setDetailLoad('MATERIALS');

        mtlLoader.load(this.urlFile.replace('obj', 'mtl'), (materials) => {
            let objLoader = new ObjLoaderService();

            if (materials) {
                materials.preload();
                objLoader.setMaterials(materials);
            }

            this.setDetailLoad('OBJECTS');

            objLoader.load(this.urlFile, (object) => {
                this.loading = false;
                object.position.y = -95;
                this.scene.add(object);
            }, (progress) => {
                console.log('progress obj loader' + JSON.stringify(progress));
            }, (error) => {
                console.log('error' + error);
            });

        }, (progress) => {
            console.log('progress material loader' + JSON.stringify(progress));
        }, (error) => {
            console.log('error material loader' + error);
        });
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
