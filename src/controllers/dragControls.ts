import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class DragControls extends THREE.EventDispatcher {

    mouse: any = new THREE.Vector2();
    camera: any;
    container: any;
    plane: any = new THREE.Plane();
    raycaster: any = new THREE.Raycaster();

    offset: any = new THREE.Vector3();
    intersection: any = new THREE.Vector3();
    selected: any = null;
    hovered: any = null;
    objects: any = null;

    constructor(container, camera, objects) {
        super();

        this.camera = camera;
        this.container = container;
        this.objects = objects;
        this.activate();
    }

    dispatchEvent(event) {
        super.dispatchEvent(event);
    }

    activate() {
        this.container.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
        this.container.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);
        this.container.addEventListener('mouseup', this.onDocumentMouseUp.bind(this), false);
    }

    onDocumentMouseMove(event) {
        event.preventDefault();

        this.mouse.x = ( event.clientX / this.container.width ) * 2 - 1;
        this.mouse.y = -( event.clientY / this.container.height ) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        if (this.selected) {
            if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
                this.selected.position.copy(this.intersection.sub(this.offset));
            }

            this.dispatchEvent({type: 'drag', object: this.selected});
            return;
        }

        this.raycaster.setFromCamera(this.mouse, this.camera);

        let intersects = this.raycaster.intersect.objects(this.objects);

        if (intersects.length > 0) {
            let object = intersects[0].object;

            this.plane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(this.plane.normal), object.position);

            if (this.hovered !== object) {
                this.dispatchEvent({type: 'hoveron', object: object});
                this.container.style.cursor = 'pointer';
                this.hovered = object;
            }

        } else {
            if (this.hovered !== null) {
                this.dispatchEvent({type: 'hoveroff', object: this.hovered});
                this.container.style.cursor = 'auto';
                this.hovered = null;
            }
        }
    }

    onDocumentMouseDown(event) {
        event.preventDefault();
        this.raycaster.setFromCamera(this.mouse, this.camera);

        let intersects = this.raycaster.intersectObjects(this.objects);

        if (intersects.length > 0) {
            this.selected = intersects[0].object;

            if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
                this.offset.copy(this.intersection).sub(this.selected.position);
            }

            this.container.style.cursor = 'move';
            this.dispatchEvent({type: 'dragstart', object: this.selected});
        }
    }

    onDocumentMouseUp(event) {
        event.preventDefault();

        if (this.selected) {
            this.dispatchEvent({type: 'dragend', object: this.selected});

            this.selected = null;

        }
        this.container.style.cursor = 'auto';

    }

}
