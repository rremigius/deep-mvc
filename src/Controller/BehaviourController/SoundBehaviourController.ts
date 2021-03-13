import BehaviourController from "@/Controller/BehaviourController";
import {ControllerAction, ControllerEvent, injectableController} from "@/Controller";
import Log from "@/log";
// import {Howl } from 'howler';

import SoundBehaviourModel from "@/models/BehaviourModel/SoundBehaviourModel";

const log = Log.instance("object/behaviour/Sound");
export class PlayAction extends ControllerAction<void> {}

@injectableController()
export default class SoundBehaviourController extends BehaviourController {
	static ModelClass = SoundBehaviourModel;

	log = log;

	get soundBehaviour() {
		return <SoundBehaviourModel>this.model;
	}

	init(model:SoundBehaviourModel) {
		super.init(model);

		this.registerAction(PlayAction, () => {
			this.play();
		});
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
