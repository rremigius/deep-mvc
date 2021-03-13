import BehaviourController from "@/Controller/BehaviourController";
import TweenBehaviourModel from "@/models/BehaviourModel/TweenBehaviourModel";
import {ControllerEvent, ControllerEvents, injectableController} from "@/Controller";
import TweenStepModel from "@/models/BehaviourModel/TweenBehaviourModel/TweenStepModel";
import Log from "@/log";
import {TimelineMax, TweenLite} from "gsap";
import BehaviourModel from "@/models/BehaviourModel";
import {extend, get} from 'lodash';

const log = Log.instance("Engine/Behaviour/Tween");

class TweenStartedEvent extends ControllerEvent<void> {}
class TweenCompletedEvent extends ControllerEvent<void> {}
class TweenBehaviourControllerEvents extends ControllerEvents {
	started = this.$event(TweenStartedEvent);
	completed = this.$event(TweenCompletedEvent);
}

@injectableController()
export default class TweenBehaviourController extends BehaviourController {
	static ModelClass = TweenBehaviourModel;

	log = log;
	events = new TweenBehaviourControllerEvents();

	// Created on init
	timeline!:TimelineMax;

	get tweenBehaviour() {
		return <TweenBehaviourModel>this.model;
	}

	init(model:TweenBehaviourModel) {
		super.init(model);
		this.initTimeline();
	}

	initTimeline() {
		this.timeline = new TimelineMax({
			repeat: this.tweenBehaviour.repeat,
			yoyo: this.tweenBehaviour.yoyo,
			repeatDelay: this.tweenBehaviour.repeatDelay,
			paused: true,
			onComplete: this._animationComplete.bind(this)
		});
		this.tweenBehaviour.steps.each((step:TweenStepModel) => {
			let tween = this.createTween(step);
			this.timeline.add(tween);
		});
	}

	createTween(step:TweenStepModel):TweenLite {
		let target = step.target;
		if(!target) {
			// If target is not defined, find parent Behaviour
			let parent = step.$parent;
			if(parent && parent instanceof BehaviourModel) { // this should probably always be the case
				parent = parent.getObject();
				if(parent) {
					target = parent;
				}
			}
		}
		if(!target) {
			let msg = "No target defined on TweenStep and no apparent BehaviourModel parent found.";
			this.log.error(msg);
			throw new Error(msg);
		}
		if(step.targetPath) {
			target = get(target, step.targetPath);
		}
		if(!target) {
			let msg = `Target path '${step.targetPath}' not found.`;
			this.log.error(msg);
			throw new Error(msg);
		}

		// Apply default values for animation
		let options = step.$export();

		// Create TweenLite options object
		let tweenProperties = step.tweenProperties ? step.tweenProperties.export() : {};
		delete tweenProperties.id; // don't tween id property

		let tween = extend({}, tweenProperties, {
			ease: options.ease,
			onStart: () => {
				log.log('Start tween:', target, 'to:', tweenProperties);
			},
			onComplete: () => {
				log.log('Tween complete:', target, 'to:', tweenProperties);
			}
		});

		return TweenLite.to(target, options.duration, tween);
	}

	onStart() {
		this.events.started.fire(new TweenStartedEvent(this));
		this.timeline.play();
	}

	_animationComplete() {
		this.events.completed.fire(new TweenCompletedEvent(this));
	}
}
