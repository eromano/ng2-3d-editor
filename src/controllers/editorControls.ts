import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class EditorControls extends THREE.EventDispatcher {

    panSpeed: any = 0.001;
    zoomSpeed: any = 0.001;
    rotationSpeed: any = 0.005;

    container: any;
    pointer: any = new THREE.Vector2();
    pointerOld: any = new THREE.Vector2();
    STATE: any = {NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2};
    state: any;

    center: any = new THREE.Vector3();
    vector: any = new THREE.Vector3();
    spherical: any = new THREE.Spherical();
    camera: any;
    changeEvent: any = {type: 'change'};
    normalMatrix: any = new THREE.Matrix3();

    constructor(container: any, camera: any) {
        super();
        this.state = this.STATE.NONE;
        this.center = new THREE.Vector3();

        this.camera = camera;
        this.container = container;
        this.container.addEventListener('contextmenu', this.contextmenu.bind(this), false);
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        this.container.addEventListener('wheel', this.onMouseWheel.bind(this), false);
    }

    onMouseDown(event) {
        if (event.button === 0) {
            this.state = this.STATE.ROTATE;
        } else if (event.button === 1) {
            this.state = this.STATE.ZOOM;
        } else if (event.button === 2) {
            this.state = this.STATE.PAN;
        }

        this.pointerOld.set(event.clientX, event.clientY);

        this.container.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        this.container.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        this.container.addEventListener('mouseout', this.onMouseUp.bind(this), false);
        this.container.addEventListener('dblclick', this.onMouseUp.bind(this), false);
    }

    onMouseMove(event) {
        this.pointer.set(event.clientX, event.clientY);

        let movementX = this.pointer.x - this.pointerOld.x;
        let movementY = this.pointer.y - this.pointerOld.y;

        if (this.state === this.STATE.ROTATE) {
            this.rotate(new THREE.Vector3(-movementX * this.rotationSpeed, -movementY * this.rotationSpeed, 0));
        } else if (this.state === this.STATE.ZOOM) {
            this.zoom(new THREE.Vector3(0, 0, movementY));
        } else if (this.state === this.STATE.PAN) {
            this.pan(new THREE.Vector3(-movementX, movementY, 0));
        }

        this.pointerOld.set(event.clientX, event.clientY);
    }

    focus(target) {
        let box = new THREE.Box3().setFromObject(target);
        this.camera.lookAt(this.center.copy(box.getCenter()));
        this.dispatchEvent(this.changeEvent);
    }

    dispatchEvent(event) {
        super.dispatchEvent(event);
    }

    pan(delta) {
        let distance = this.camera.position.distanceTo(this.center);

        delta.multiplyScalar(distance * this.panSpeed);
        delta.applyMatrix3(this.normalMatrix.getNormalMatrix(this.camera.matrix));

        this.camera.position.add(delta);
        this.center.add(delta);

        this.dispatchEvent(this.changeEvent);
    }

    zoom(delta) {
        let distance = this.camera.position.distanceTo(this.center);

        delta.multiplyScalar(distance * this.zoomSpeed);

        if (delta.length() > distance) {
            return;
        }

        delta.applyMatrix3(this.normalMatrix.getNormalMatrix(this.camera.matrix));

        this.camera.position.add(delta);

        this.dispatchEvent(this.changeEvent);
    }

    rotate(delta) {
        this.vector.copy(this.camera.position).sub(this.center);

        this.spherical.setFromVector3(this.vector);

        this.spherical.theta += delta.x;
        this.spherical.phi += delta.y;

        this.spherical.makeSafe();

        this.vector.setFromSpherical(this.spherical);

        this.camera.position.copy(this.center).add(this.vector);

        this.camera.lookAt(this.center);

        this.dispatchEvent(this.changeEvent);
    }

    onMouseWheel(event) {
        event.preventDefault();
        this.zoom(new THREE.Vector3(0, 0, event.deltaY));
    }

    onMouseUp() {
        this.container.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
        this.container.removeEventListener('mouseup', this.onMouseUp.bind(this), false);
        this.container.removeEventListener('mouseout', this.onMouseUp.bind(this), false);
        this.container.removeEventListener('dblclick', this.onMouseUp.bind(this), false);
        this.state = this.STATE.NONE;
    }

    contextmenu(event) {
        event.preventDefault();
    }

}
