import {Scene} from "three";
import SceneRenderInterface from "@/renderers/common/ObjectRenderInterface/SceneRenderInterface";
import {injectable} from "@/renderers/inversify";
import threeContainer from "@/renderers/threejs/inversify";
import ThreeObject from "@/renderers/threejs/ThreeObject";
import {alphanumeric} from "mozel";

@injectable(threeContainer, "SceneRenderInterface")
export default class ThreeScene extends ThreeObject implements SceneRenderInterface {
	public gid: alphanumeric = "_SCENE"; // Will be overwritten by ObjectController

	protected createObject3D():Scene {
		return new Scene();
	}
	public getObject3D():Scene {
		return <Scene>super.getObject3D();
	}
}
