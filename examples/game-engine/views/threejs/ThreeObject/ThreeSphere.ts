import ThreeObject from "../ThreeObject";
import SphereModel from "@examples/game-engine/models/ObjectModel/SphereModel";
import {Color, Mesh, MeshBasicMaterial, SphereGeometry} from "three";
import {schema} from "mozel";
import {root} from "../ThreeView";
import {throttle} from "lodash";

const RootMesh = root(Mesh);
export default class ThreeSphere extends ThreeObject {
	static Model = SphereModel;
	model!:SphereModel;

	get mesh() {
		return this.object3D as unknown as Mesh; // TS: see createObject3D
	}

	onInit() {
		super.onInit();
		this.watch(schema(ThreeSphere.Model).segments, () => {
			this.updateGeometry();
		});
		this.watch(schema(ThreeSphere.Model).radius, () => {
			this.updateGeometry();
		});
		this.watch(schema(ThreeSphere.Model).color, color => {
			if(!(this.mesh.material instanceof MeshBasicMaterial)) return;
			this.mesh.material.color = new Color(color);
		});
	}

	createGeometry() {
		const segments = this.model.segments || 8;
		return new SphereGeometry(this.model.radius, segments, Math.ceil(segments * 0.75));
	}

	updateGeometry = throttle(() => {
		this.mesh.geometry = this.createGeometry();
	}, 1);

	createObject3D() {
		const geometry = this.createGeometry();
		const material = new MeshBasicMaterial();
		return new RootMesh(geometry, material);
	}
}
