import {Scene} from "three";
import SceneModel from "@examples/game-engine/models/SceneModel";
import ThreeView, {root} from "@examples/game-engine/views/threejs/ThreeView";
import {components} from "@/Component";
import {schema} from "mozel";
import ComponentList from "@/Component/ComponentList";
import ThreeObject from "./ThreeObject";

const RootScene = root(Scene);
export default class ThreeScene extends ThreeView {
	static Model = SceneModel;
	model!:SceneModel;

	@components(schema(ThreeScene.Model).objects, ThreeObject)
	objects!:ComponentList<ThreeObject>

	createObject3D() {
		return new RootScene();
	}
}
