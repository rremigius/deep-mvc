import RendererInterface from "@/renderers/common/RendererInterface";
import {Object3D, Vector2} from 'three';
import Err from "@utils/error";
import {CSS3DRenderer} from "three-css3drenderer";
import {injectableRenderClass} from "@/renderers/inversify";
import threeContainer from "@/renderers/threejs/inversify";
import RendererCSS3DInterface from "@/renderers/common/RendererCSS3DInterface";
import ThreeScene from "@/renderers/threejs/ThreeObject/ThreeScene";
import ThreeCamera from "@/renderers/threejs/ThreeObject/ThreeCamera";

@injectableRenderClass(threeContainer, "RendererCSS3DInterface")
export default class ThreeRendererCSS3D implements RendererCSS3DInterface<Object3D> {
	renderer:CSS3DRenderer;

	constructor() {
		const renderer = new CSS3DRenderer();
		const size = renderer.getSize();
		renderer.setSize(size.width, size.height);

		this.renderer = renderer;
	}
	setMainRenderer(renderer:RendererInterface<Object3D>) {
		this.renderer.domElement.style.position = renderer.getDOMElement().style.position;
		this.renderer.domElement.style.top = renderer.getDOMElement().style.top;
		this.renderer.domElement.style.left = renderer.getDOMElement().style.left;
	}
	render(scene: any, camera: any): void {
		// if scene type is not `any`, typescript will complain about redundancy of the checks
		if(!(scene instanceof ThreeScene)) {
			throw new Err({message: "Invalid ThreeScene.", data: scene});
		}
		if(!(camera instanceof ThreeCamera)) {
			throw new Err({message:"Invalid ThreeCamera.", data: camera});
		}

		this.renderer.render(scene.getRenderObject(), camera.getRenderObject());
	}
	getDOMElement() {
		return this.renderer.domElement;
	}

	getSize() {
		const vector = new Vector2();
		this.renderer.getSize(vector);
		return {width: vector.width, height: vector.height};
	}

	setSize(width: number, height:number) {
		this.renderer.setSize(width, height);
	}
}
