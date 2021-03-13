import InteractionManagerInterface from "../common/InteractionManagerInterface";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import SceneRenderInterface from "@/renderers/common/ObjectRenderInterface/SceneRenderInterface";
import ThreeCamera from "./ThreeObject/ThreeCamera";
import Err from "@utils/error";
import {Camera, Object3D, Raycaster, Scene, Vector2} from "three";
import ThreeScene from "./ThreeObject/ThreeScene";
import {RootObject3D} from "./ThreeObject/ThreeControllerRoot";
import {injectableRenderConstructor} from "@/renderers/inversify";
import threeContainer from "@/renderers/threejs/inversify";

@injectableRenderConstructor(threeContainer, "InteractionManagerInterface")
export default class ThreeInteractionManager implements InteractionManagerInterface<Object3D> {
	protected mouse = new Vector2();
	protected raycaster = new Raycaster();
	protected camera: Camera;
	protected scene: Scene;

	protected readonly _handleMouseMove: (e: MouseEvent) => void;
	protected readonly _handleClick: (e: MouseEvent) => void;

	constructor(camera: CameraRenderInterface<Camera>, scene: SceneRenderInterface<Scene>) {
		if (!(camera instanceof ThreeCamera)) {
			throw new Err({
				message: `camera is not a ThreeCamera or a ThreePerspectiveCamera`
			});
		}
		if (!(scene instanceof ThreeScene)){
			throw new Err({
				message: `scene is not a ThreeScene`
			});
		}
		this.camera = camera.getRenderObject();
		this.scene = scene.getRenderObject();

		this._handleMouseMove = this.handleMouseMove.bind(this);
		window.addEventListener('mousemove', (e) => { this._handleMouseMove(e);} );
		this._handleClick = this.handleClick.bind(this);
		window.addEventListener('click', (e) => { this._handleClick(e);} );
	}

	destroy() {
		window.removeEventListener('mousemove', this._handleMouseMove);
		window.removeEventListener('click', this._handleClick);
	}

	protected handleMouseMove(event: MouseEvent) {
		this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}

	protected handleClick(event: MouseEvent) {
		if(!this.camera || !this.scene) return;

		this.raycaster.setFromCamera(this.mouse, this.camera);

		// calculate objects intersecting the picking ray
		const intersects = this.raycaster.intersectObjects( this.scene.children, true);
		if (!intersects.length) {
			return;
		}

		const root = findRoot(intersects[0].object);
		if (!root) {
			return;
		}
		const meshes = intersects.map((i) => i.object.name);
		root.onClick({ meshes });
	}
}

/** Given an Object3d (most likely a Mesh), finds the ThreeRootObject it lies under */
const findRoot = (object: Object3D): RootObject3D | null => {
	let currentObject = object;
	while (currentObject != null) {
		if(currentObject instanceof RootObject3D){
			return currentObject;
		}
		currentObject = currentObject.parent!;
	}
	return null;
};
