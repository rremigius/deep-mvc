import View from "@/View";
import Engine from "@examples/game-engine/Engine";

export default abstract class EngineView extends View {
	_engine?: Engine;
	get engine() {
		return this._engine;
	}

	abstract render(): void;

	setEngine(engine: Engine) {
		this._engine = engine;
	}
}
