import View from "@/View";
import Engine, {KeyboardEvent} from "@/Engine/Engine";

export default class EngineView extends View {
	_engine?:Engine;
	get engine() {
		return this._engine;
	}

	setEngine(engine:Engine) {
		this._engine = engine;
	}

	setSize(width:number, height:number) {

	}

	render() {

	}

	attachTo(container:HTMLElement) {

	}

	detach() {

	}
}
