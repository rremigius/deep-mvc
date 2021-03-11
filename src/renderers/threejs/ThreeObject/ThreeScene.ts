import {Scene} from "three";
import {alphanumeric} from "@common/classes/Model/Model";
import XRSceneRenderInterface from "@/classes/renderers/common/XRObjectRenderInterface/XRSceneRenderInterface";
import {injectableRenderClass} from "@/classes/renderers/inversify";
import threeContainer from "@/classes/renderers/threejs/inversify";
import XRThreeObject from "@/classes/renderers/threejs/XRThreeObject";

@injectableRenderClass(threeContainer, "XRSceneRenderInterface")
export default class ThreeScene extends XRThreeObject implements XRSceneRenderInterface<Scene> {
	public gid: alphanumeric = "_SCENE"; // Will be overwritten by XRObjectController

	protected createObject3D():Scene {
		return new Scene();
	}
	public getRenderObject():Scene {
		return <Scene>super.getRenderObject();
	}
}
