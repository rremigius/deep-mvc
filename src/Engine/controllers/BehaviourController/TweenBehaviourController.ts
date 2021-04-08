import BehaviourController from "@/Engine/controllers/BehaviourController";
import TweenBehaviourModel from "@/Engine/models/BehaviourModel/TweenBehaviourModel";
import {ControllerEvent, ControllerEvents} from "@/Controller";
import TweenStepModel from "@/Engine/models/BehaviourModel/TweenBehaviourModel/TweenStepModel";
import Log from "@/log";
import {TimelineMax, TweenLite} from "gsap";
import {extend, get} from 'lodash';
import ObjectModel from "@/Engine/models/ObjectModel";
import {deep, immediate, schema} from "mozel";

const log = Log.instance("tween-behaviour");

class TweenStartedEvent extends ControllerEvent<object> {}
class TweenCompletedEvent extends ControllerEvent<object> {}

class TweenBehaviourControllerEvents extends ControllerEvents {
	started = this.$event(TweenStartedEvent);
	completed = this.$event(TweenCompletedEvent);
}

export default class TweenBehaviourController extends BehaviourController {
	static ModelClass = TweenBehaviourModel;

	events = new TweenBehaviourControllerEvents();

	// Created on init
	timeline!:TimelineMax;

	get tweenBehaviour() {
		return <TweenBehaviourModel>this.model;
	}

	init(model:TweenBehaviourModel) {
		super.init(model);
		model.$watch(schema(TweenBehaviourModel), () => {
			// Basically, if anything happens, we need to re-initialize the timeline
			this.initTimeline();
		}, {immediate, deep});
	}

	initTimeline() {
		if(this.timeline) this.timeline.kill();

		let repeat = this.tweenBehaviour.repeat;
		if(repeat === undefined && this.tweenBehaviour.yoyo) {
			repeat = -1; // yoyo needs repeat
		}
		this.timeline = new TimelineMax({
			repeat: repeat,
			yoyo: this.tweenBehaviour.yoyo,
			repeatDelay: this.tweenBehaviour.repeatDelay,
			paused: !this.enabled,
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
			// No target defined, use parent ObjectModel
			const parent = this.model.$parent;
			if(parent instanceof ObjectModel) {
				target = parent;
			}
		}
		if(!target) {
			let msg = "No target defined on TweenStep and no apparent BehaviourModel parent found.";
			log.error(msg);
			throw new Error(msg);
		}
		if(step.path) {
			target = get(target, step.path);
		}
		if(target === undefined) {
			let msg = `Target path '${step.path}' not found.`;
			log.error(msg);
			throw new Error(msg);
		}

		// Create TweenLite options object
		let tweenProperties = step.to ? step.to.$export() : {};
		delete tweenProperties.id; // don't tween id property
		delete tweenProperties.gid; // don't tween gid property

		let tween = extend({}, tweenProperties, {
			ease: step.ease,
			onStart: () => {
				log.log('Start tween:', target, 'to:', tweenProperties);
			},
			onComplete: () => {
				log.log('Tween complete:', target, 'to:', tweenProperties);
			}
		});

		return TweenLite.to(target, step.duration, tween);
	}

	onEnable() {
		this.events.started.fire(new TweenStartedEvent(this));
		this.timeline.play();
	}

	_animationComplete() {
		this.events.completed.fire(new TweenCompletedEvent(this));
	}
}
