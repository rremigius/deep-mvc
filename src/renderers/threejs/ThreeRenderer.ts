import XRRendererInterface from "@/classes/renderers/common/XRRendererInterface";
import {Color, Object3D, Vector2, WebGLRenderer} from 'three';
import Err from "@utils/error";
import {injectableRenderClass} from "@/classes/renderers/inversify";
import threeContainer from "@/classes/renderers/threejs/inversify";
import XRThreeScene from "@/classes/renderers/threejs/XRThreeObject/XRThreeScene";
import XRThreeCamera from "@/classes/renderers/threejs/XRThreeObject/XRThreeCamera";

@injectableRenderClass(threeContainer, "XRRendererInterface")
export default class ThreeRenderer implements XRRendererInterface<Object3D> {
	renderer:WebGLRenderer;

	constructor() {
		const renderer = new WebGLRenderer({alpha: true});
		renderer.setClearColor(new Color('lightgrey'), 0);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.domElement.style.position = 'absolute';
		renderer.domElement.style.top = '0px';
		renderer.domElement.style.left = '0px';

		this.renderer = renderer;
	}

	render(scene: any, camera: any): void {
		// if scene type is not `any`, typescript will complain abot instanceof "has type that is not related"
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

	getWebGLRenderer() {
		return this.renderer;
	}
}
