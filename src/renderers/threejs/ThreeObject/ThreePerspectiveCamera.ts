import {PerspectiveCamera} from "three";
import {alphanumeric} from "@common/classes/Model/Model";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import {injectableObjectRender} from "@/renderers/inversify";
import container from '../inversify';
import ThreeCamera from "@/renderers/threejs/ThreeObject/ThreeCamera";

@injectableObjectRender(container, "CameraRenderInterface")
export default class ThreePerspectiveCamera extends ThreeCamera implements CameraRenderInterface<PerspectiveCamera> {
	public gid: alphanumeric = "_CAMERA";

	createObject3D() {
		return new PerspectiveCamera();
	}
	getRenderObject():PerspectiveCamera {
		return <PerspectiveCamera>super.getRenderObject();
	}

	public setAspectRatio(ratio: number): void {
		this.getRenderObject().aspect = ratio;
		this.getRenderObject().updateProjectionMatrix();
	}
}
