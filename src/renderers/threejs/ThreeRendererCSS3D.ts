import XRRendererInterface from "@/classes/renderers/common/XRRendererInterface";
import {Object3D, Vector2} from 'three';
import Err from "@utils/error";
import {CSS3DRenderer} from "three-css3drenderer";
import {injectableRenderClass} from "@/classes/renderers/inversify";
import threeContainer from "@/classes/renderers/threejs/inversify";
import XRRendererCSS3DInterface from "@/classes/renderers/common/XRRendererCSS3DInterface";
import XRThreeScene from "@/classes/renderers/threejs/XRThreeObject/XRThreeScene";
import XRThreeCamera from "@/classes/renderers/threejs/XRThreeObject/XRThreeCamera";

@injectableRenderClass(threeContainer, "XRRendererCSS3DInterface")
export default class ThreeRendererCSS3D implements XRRendererCSS3DInterface<Object3D> {
	renderer:CSS3DRenderer;

	constructor() {
		const renderer = new CSS3DRenderer();
		const size = renderer.getSize();
		renderer.setSize(size.width, size.height);

		this.renderer = renderer;
	}
	setMainRenderer(renderer:XRRendererInterface<Object3D>) {
		this.renderer.domElement.style.position = renderer.getDOMElement().style.position;
		this.renderer.domElement.style.top = renderer.getDOMElement().style.top;
		this.renderer.domElement.style.left = renderer.getDOMElement().style.left;
	}
	render(scene: any, camera: any): void {
		// if scene type is not `any`, typescript will complain about redundancy of the checks
		if(!(scene instanceof XRThreeScene)) {
			throw new Err({message: "Invalid XRThreeScene.", data: scene});
		}
		if(!(camera instanceof XRThreeCamera)) {
			throw new Err({message:"Invalid XRThreeCamera.", data: camera});
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
