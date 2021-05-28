import ViewFactory from "@/View/ViewFactory";
import UIEngineView from "./UIEngineView";
import UISceneView from "./UISceneView";
import UIView from "@/Engine/views/ui/UIView";
import View from "@/View";

export default class UIFactory extends ViewFactory {
	initDependencies() {
		super.initDependencies();
		this.register([
			UIEngineView, UISceneView
		]);
		this.registerDefault(View, UIView);
	}
}
