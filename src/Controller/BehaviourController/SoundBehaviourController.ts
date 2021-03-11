import BehaviourController from "@/Controller/BehaviourController";
import {injectableController} from "@/Controller";
import Log from "@/log";
// import {Howl } from 'howler';

import SoundBehaviourModel from "@/models/BehaviourModel/SoundBehaviourModel";
import { Event } from "@/Events";

const log = Log.instance("Engine/Behaviour/Sound");
export class PlayAction extends Event<null> {}

@injectableController()
export default class SoundBehaviourController extends BehaviourController {
	static ModelClass = SoundBehaviourModel;

	get soundBehaviour() {
		return <SoundBehaviourModel>this.model;
	}

	init(model:SoundBehaviourModel) {
		super.init(model);

		this.registerAction<PlayAction>(PlayAction.name, this.play);
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
