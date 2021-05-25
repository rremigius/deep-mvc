import EngineView from "../EngineView";
import EngineModel from "@/Engine/models/EngineModel";
import {component} from "@/Component";
import {schema} from "mozel";
import ComponentSlot from "@/Component/ComponentSlot";
import {Color, Intersection, Object3D, Raycaster, Renderer, Vector2, WebGLRenderer} from "three";
import ThreeView, {ThreeViewRoot} from "./ThreeView";
import Log from "@/log";
import ThreeCamera from "./ThreeObject/ThreeCamera";

const log = Log.instance("view/three/engine");

export class ThreeClickEvent {
	constructor(public intersects:Intersection[]) {}
}

const engineSchema = schema(EngineModel);
export default class ThreeEngineView extends EngineView {
	static Model = EngineModel;
	model!:EngineModel;

	@component(engineSchema.camera, ThreeCamera)
	camera!:ComponentSlot<ThreeCamera>;

	@component(engineSchema.scene, ThreeView)
	scene!:ComponentSlot<ThreeView>;

	renderer!:Renderer;
	css3DRenderer!:Renderer; // TODO: make CSS3DRenderer

	protected mouse = new Vector2();
	protected raycaster = new Raycaster();

	private _handleMouseMove!: (e: MouseEvent) => void;
	private _handleClick!: (e: MouseEvent) => void;

	init(model: EngineModel) {
		super.init(model);
		this.renderer = this.createRenderer();
		this.css3DRenderer = this.createCSS3DRenderer();

		this.copyStylesToCSS3D();

		this._handleMouseMove = this.handleMouseMove.bind(this);
		window.addEventListener('mousemove', (e) => { this._handleMouseMove(e);} );
		this._handleClick = this.handleClick.bind(this);
		window.addEventListener('click', (e) => { this._handleClick(e);} );
	}

	createRenderer() {
		const renderer = new WebGLRenderer({alpha: true});
		renderer.setClearColor(new Color('lightgrey'), 0);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.domElement.style.position = 'absolute';
		renderer.domElement.style.top = '0px';
		renderer.domElement.style.left = '0px';

		return renderer;
	}

	createCSS3DRenderer() {
		const renderer = new WebGLRenderer(); // TODO: Make CSS3DRenderer
		renderer.domElement.style.pointerEvents = 'none';

		return renderer;
	}

	setSize(width: number, height:number) {
		this.renderer.setSize(width, height);
		this.css3DRenderer.setSize(width, height);
		this.copyStylesToCSS3D();

		const camera = this.camera.get();
		if(camera) {
			camera.setAspectRatio(width / height);
		}
	}

	copyStylesToCSS3D() {
		const target = this.css3DRenderer.domElement;
		const source = this.renderer.domElement;
		target.style.position = source.style.position;
		target.style.top = source.style.top;
		target.style.left = source.style.left;
		target.style.width = source.style.width;
		target.style.height = source.style.height;
		target.style.marginLeft = source.style.marginLeft;
		target.style.marginTop = source.style.marginTop;
	}

	attachTo(element: HTMLElement): void {
		element.append(this.renderer.domElement);
		// element.append(this.css3DRenderer.domElement);
		this.copyStylesToCSS3D();
	}

	detach(): void {
		this.renderer.domElement.remove();
		// this.css3DRenderer.domElement.remove();
	}

	render(): void {
		const scene = this.scene.get();
		const camera = this.camera.get();
		if(!scene) {
			log.error("No scene set. Cannot render.");
			return;
		}
		if(!camera) {
			log.error("No camera set. Cannot render.");
			return;
		}

		this.renderer.render(scene.object3D, camera.camera);
		// this.css3DRenderer.render(scene.object3D, camera.camera);
	}

	protected handleMouseMove(event: MouseEvent) {
		this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}

	protected handleClick(event: MouseEvent) {
		const cameraView = this.camera.get();
		const sceneView = this.scene.get();
		if(!cameraView || !sceneView) return;

		const camera = cameraView.camera;
		const scene = sceneView.object3D;

		this.raycaster.setFromCamera(this.mouse, camera);

		// calculate objects intersecting the picking ray
		const intersects = this.raycaster.intersectObjects( scene.children, true);
		if (!intersects.length) {
			return;
		}

		const root = findRoot(intersects[0].object);
		if (!root) {
			return;
		}
		root.onClick(new ThreeClickEvent(intersects));
	}
}

/** Given an Object3d (most likely a Mesh), finds the ThreeRootObject it lies under */
const findRoot = (object: Object3D): ThreeViewRoot | null => {
	let currentObject = object;
	while (currentObject != null) {
		if('onClick' in currentObject){
			return currentObject;
		}
		currentObject = currentObject.parent!;
	}
	return null;
};
