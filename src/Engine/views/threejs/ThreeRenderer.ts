import IRenderer, {IRendererSymbol} from "@/Engine/views/common/IRenderer";
import {Color, Vector2, WebGLRenderer} from 'three';
import threeContainer from "@/Engine/views/threejs/dependencies";
import ThreeScene from "@/Engine/views/threejs/ThreeScene";
import ThreeCamera from "@/Engine/views/threejs/ThreeObject/ThreeCamera";
import ThreeInteractionManager from "@/Engine/views/threejs/ThreeInteractionManager";
import {injectable} from "@/Engine/views/dependencies";
import {CSS3DViewer} from "three-css3drenderer";

@injectable(threeContainer, IRendererSymbol)
export default class ThreeViewer implements IRenderer {
	renderer:WebGLRenderer;
	interactionManager:ThreeInteractionManager = new ThreeInteractionManager();
	css3DViewer = new CSS3DViewer();

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
		this.css3DViewer = new CSS3DViewer();
		this.copySizeToCSS3D();
		this.copyPositionToCSS3D();
	}

	copyPositionToCSS3D() {
		const target = this.css3DViewer.domElement;
		const source = this.renderer.domElement;
		target.style.position = source.style.position;
		target.style.top = source.style.top;
		target.style.left = source.style.left;
	}

	copySizeToCSS3D() {
		const target = this.css3DViewer.domElement;
		const source = this.renderer.domElement;
		target.style.width = source.style.width;
		target.style.height = source.style.height;
		target.style.marginLeft = source.style.marginLeft;
		target.style.marginTop = source.style.marginTop;
	}

	attachTo(element: HTMLElement): void {
		element.append(this.renderer.domElement);
		element.append(this.css3DViewer.getDOMElement());
		this.copyPositionToCSS3D();
		this.copySizeToCSS3D();
    }

	detach(): void {
		this.renderer.domElement.remove();
		this.css3DViewer.getDOMElement().remove();
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
		this.css3DViewer.render(scene, camera);

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
		this.css3DViewer.setSize(width, height);
		this.copySizeToCSS3D();
	}

	destroy() {
		this.interactionManager.destroy();
	}
}
