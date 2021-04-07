import IRenderer from "@/Engine/views/common/IRenderer";
import {Color, Vector2, WebGLRenderer} from 'three';
import ThreeScene from "@/Engine/views/threejs/ThreeScene";
import ThreeCamera from "@/Engine/views/threejs/ThreeObject/ThreeCamera";
import ThreeInteractionManager from "@/Engine/views/threejs/ThreeInteractionManager";
import {CSS3DRenderer} from "three-css3drenderer";

export default class ThreeRenderer implements IRenderer {
	renderer:WebGLRenderer;
	interactionManager:ThreeInteractionManager = new ThreeInteractionManager();
	css3DRenderer = new CSS3DRenderer();

	constructor() {
		const renderer = new WebGLRenderer({alpha: true});
		renderer.setClearColor(new Color('lightgrey'), 0);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.domElement.style.position = 'absolute';
		renderer.domElement.style.top = '0px';
		renderer.domElement.style.left = '0px';

		this.renderer = renderer;

		this.createCSS3DViewer();
	}

	createCSS3DViewer() {
		this.css3DRenderer = new CSS3DRenderer();
		this.css3DRenderer.domElement.style.pointerEvents = 'none';
		this.copySizeToCSS3D();
		this.copyPositionToCSS3D();
	}

	copyPositionToCSS3D() {
		const target = this.css3DRenderer.domElement;
		const source = this.renderer.domElement;
		target.style.position = source.style.position;
		target.style.top = source.style.top;
		target.style.left = source.style.left;
	}

	copySizeToCSS3D() {
		const target = this.css3DRenderer.domElement;
		const source = this.renderer.domElement;
		target.style.width = source.style.width;
		target.style.height = source.style.height;
		target.style.marginLeft = source.style.marginLeft;
		target.style.marginTop = source.style.marginTop;
	}

	attachTo(element: HTMLElement): void {
		element.append(this.renderer.domElement);
		element.append(this.css3DRenderer.domElement);
		this.copyPositionToCSS3D();
		this.copySizeToCSS3D();
    }

	detach(): void {
		this.renderer.domElement.remove();
		this.css3DRenderer.domElement.remove();
	}

	render(scene: any, camera: any): void {
		// if scene type is not `any`, typescript will complain abot instanceof "has type that is not related"
		if(!(scene instanceof ThreeScene)) {
			throw new Error("Invalid ThreeScene.");
		}
		if(!(camera instanceof ThreeCamera)) {
			throw new Error("Invalid ThreeCamera.");
		}

		this.renderer.render(scene.getObject3D(), camera.getObject3D());
		this.css3DRenderer.render(scene.getObject3D(), camera.getObject3D());

		this.interactionManager.scene = scene;
		this.interactionManager.camera = camera;
	}

	getSize() {
		const vector = new Vector2();
		this.renderer.getSize(vector);
		return {width: vector.width, height: vector.height};
	}

	setSize(width: number, height:number) {
		this.renderer.setSize(width, height);
		this.css3DRenderer.setSize(width, height);
		this.copySizeToCSS3D();
	}

	destroy() {
		this.interactionManager.destroy();
	}
}
