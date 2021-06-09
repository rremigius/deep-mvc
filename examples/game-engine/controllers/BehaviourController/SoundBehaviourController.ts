import BehaviourController from "@examples/game-engine/controllers/BehaviourController";
import {ComponentAction, ComponentActions} from "@/Component";
import Log from "@/log";
// import {Howl } from 'howler';
import SoundBehaviourModel from "@examples/game-engine/models/BehaviourModel/SoundBehaviourModel";

export class PlayAction extends ComponentAction<void> {}
export class PlayActions extends ComponentActions {
	play = this.$action(PlayAction);
}

export default class SoundBehaviourController extends BehaviourController {
	static Model = SoundBehaviourModel;
	model!:SoundBehaviourModel;

	static Actions = PlayActions;
	actions!:PlayActions;

	onInit() {
		super.onInit();
		this.actions.play.on(this.play.bind(this));
	}

	play() {
		// if (this.soundBehaviour.file) {
		// 	const sound = new Howl({
		// 		src: [this.soundBehaviour.file.url]
		// 	});
		// 	sound.play();
		// }
	}

}
