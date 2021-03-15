import {PerspectiveCamera} from "three";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import {injectable} from "@/renderers/inversify";
import container from '../inversify';
import ThreeCamera from "@/renderers/threejs/ThreeObject/ThreeCamera";
import {alphanumeric} from "mozel";

@injectable(container, "CameraRenderInterface")
export default class ThreePerspectiveCamera extends ThreeCamera implements CameraRenderInterface {
	public gid: alphanumeric = "_CAMERA";

	createObject3D() {
		return new PerspectiveCamera();
	}
	getObject3D():PerspectiveCamera {
		return <PerspectiveCamera>super.getObject3D();
	}

	public setAspectRatio(ratio: number): void {
		this.getObject3D().aspect = ratio;
		this.getObject3D().updateProjectionMatrix();
	}
}
