import View from "@/View";
import Engine, {KeyboardEvent} from "@examples/GameEngine/Engine";

export default class EngineView extends View {
	_container?:HTMLElement;
	get container() {
		return this._container;
	}

	_engine?:Engine;
	get engine() {
		return this._engine;
	}

	setEngine(engine:Engine) {
		this._engine = engine;
	}

	resize() {
		if(!this.container) return;
		this.setSize(this.container.clientWidth, this.container.clientHeight);
	}

	setSize(width:number, height:number) {

	}

	render() {

	}

	detach() {
		if(!this._container) return;
		this.onDetach();
	}

	attachTo(container:HTMLElement) {
		if(container === this._container) return;
		this._container = container;
		this.onAttachTo(container);
	}

	onAttachTo(container:HTMLElement) {

	}

	onDetach() {

	}
}
