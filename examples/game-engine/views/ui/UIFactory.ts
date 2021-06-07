import ViewFactory from "@/View/ViewFactory";
import UIEngineView from "./UIEngineView";
import UIView from "@examples/game-engine/views/ui/UIView";
import View from "@/View";
import UISceneView from "./UISceneView";

export default class UIFactory extends ViewFactory {
	initDependencies() {
		super.initDependencies();
		this.register([
			UIEngineView, UISceneView
		]);
		this.registerDefault(View, UIView);
	}
}
