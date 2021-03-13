import {Scene} from "three";
import {alphanumeric} from "@common/classes/Model/Model";
import SceneRenderInterface from "@/renderers/common/ObjectRenderInterface/SceneRenderInterface";
import {injectableRenderClass} from "@/renderers/inversify";
import threeContainer from "@/renderers/threejs/inversify";
import ThreeObject from "@/renderers/threejs/ThreeObject";

@injectableRenderClass(threeContainer, "SceneRenderInterface")
export default class ThreeScene extends ThreeObject implements SceneRenderInterface<Scene> {
	public gid: alphanumeric = "_SCENE"; // Will be overwritten by ObjectController

	protected createObject3D():Scene {
		return new Scene();
	}
	public getRenderObject():Scene {
		return <Scene>super.getRenderObject();
	}
}
