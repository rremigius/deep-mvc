import BehaviourController from "@examples/GameEngine/controllers/BehaviourController";
import TweenBehaviourModel from "@examples/GameEngine/models/BehaviourModel/TweenBehaviourModel";
import {ComponentEvent, ComponentEvents} from "@/Component";
import TweenStepModel from "@examples/GameEngine/models/BehaviourModel/TweenBehaviourModel/TweenStepModel";
import Log from "@/log";
import {TimelineMax, TweenLite} from "gsap";
import {extend, get} from 'lodash';
import ObjectModel from "@examples/GameEngine/models/ObjectModel";
import {deep, immediate, schema} from "mozel";

const log = Log.instance("tween-behaviour");

class TweenStartedEvent extends ComponentEvent<object> {}
class TweenCompletedEvent extends ComponentEvent<object> {}

class TweenBehaviourControllerEvents extends ComponentEvents {
	started = this.$event(TweenStartedEvent);
	completed = this.$event(TweenCompletedEvent);
}

export default class TweenBehaviourController extends BehaviourController {
	static Model = TweenBehaviourModel;
	model!:TweenBehaviourModel;

	events!:TweenBehaviourControllerEvents;

	timeline!:TimelineMax;

	get tweenBehaviour() {
		return <TweenBehaviourModel>this.model;
	}

	onSetupEventsAndActions() {
		super.onSetupEventsAndActions();
		this.events = new TweenBehaviourControllerEvents();
	}

	onInit() {
		super.onInit();
		this.model.$watch(schema(TweenBehaviourModel), () => {
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
			paused: true,
			onComplete: this._animationComplete.bind(this)
		});
		this.tweenBehaviour.steps.each((step:TweenStepModel) => {
			let tween = this.createTween(step);
			this.timeline.add(tween);
		});
		if(this.enabled) this.startTween();
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

	startTween() {
		this.events.started.fire(new TweenStartedEvent(this));
		this.timeline.play();
	}

	onEnable() {
		this.startTween();
	}

	onDisable() {
		this.timeline.pause();
	}

	_animationComplete() {
		this.events.completed.fire(new TweenCompletedEvent(this));
	}
}
