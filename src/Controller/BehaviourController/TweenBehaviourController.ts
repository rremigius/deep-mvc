import BehaviourController from "@/Controller/BehaviourController";
import TweenBehaviourModel from "@/models/BehaviourModel/TweenBehaviourModel";
import {injectableController} from "@/Controller/controller";
import TweenStepModel from "@/models/BehaviourModel/TweenBehaviourModel/TweenStepModel";
import Log from "@/log";
import {TimelineMax, TweenLite} from "gsap";
import BehaviourModel from "@/models/BehaviourModel";
import Err from "@utils/error";
import {extend, get} from 'lodash';

const log = Log.instance("Engine/Behaviour/Tween");

export enum TweenBehaviourEvent {
	START = 'start',
	COMPLETE = 'complete'
}

@injectableController()
export default class TweenBehaviourController extends BehaviourController {
	static ModelClass = TweenBehaviourModel;

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
			let parent = step.getParent();
			if(parent && parent instanceof BehaviourModel) { // this should probably always be the case
				parent = parent.getObject();
				if(parent) {
					target = parent;
				}
			}
		}
		if(!target) {
			let msg = "No target defined on TweenStep and no apparent BehaviourModel parent found.";
			console.error(msg);
			throw new Err(msg);
		}
		if(step.targetPath) {
			target = get(target, step.targetPath);
		}

		// Apply default values for animation
		let options = step.export();

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
		this.fire(TweenBehaviourEvent.START);
		this.timeline.play();
	}

	_animationComplete() {
		this.fire(TweenBehaviourEvent.COMPLETE);
	}
}
