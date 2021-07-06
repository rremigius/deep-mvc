"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events = void 0;
const tslib_1 = require("tslib");
const _ = tslib_1.__importStar(require("lodash"));
const validation_kit_1 = require("validation-kit");
const log_control_1 = tslib_1.__importDefault(require("log-control"));
const log = log_control_1.default.instance("event-emitter");
function getTypeName(type) {
    const className = _.get(type, 'constructor.name');
    if (className)
        return className;
    return typeof (type);
}
class EventEmitter {
    constructor(runtimeType) {
        this.listeners = [];
        this.type = runtimeType;
    }
    listenerCount() {
        return this.listeners.length;
    }
    on(listener) {
        this.listeners.push(listener);
        return listener;
    }
    off(listener) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }
    fire(event) {
        if (this.type) {
            if (!this.isCorrectType(event)) {
                const message = `Incompatible payload. Expected '${_.get(this.type, 'name')}', received '${getTypeName(event)}'.`;
                log.error(message, event);
                throw new Error(message);
            }
        }
        this.listeners.forEach(listener => {
            listener(event);
        });
    }
    isCorrectType(value) {
        switch (this.type) {
            case undefined: return true;
            case String: return _.isString(value);
            case Number: return _.isNumber(value);
            case Boolean: return _.isBoolean(value);
            case validation_kit_1.Alphanumeric: return validation_kit_1.isAlphanumeric(value);
            default: {
                if (validation_kit_1.isClass(this.type)) {
                    return value instanceof this.type;
                }
                // Should not happen.
                throw new Error("Cannot handle type.");
            }
        }
    }
}
exports.default = EventEmitter;
class Events {
    constructor(allowDynamicEvents = false) {
        this.$byName = {};
        this.$allowDynamicEvents = allowDynamicEvents;
    }
    static getEventName(event) {
        if (_.isFunction(event)) {
            return event.name;
        }
        return event;
    }
    /**
     * Creates an EventEmitter and registers it.
     * @param EventClass
     * @param name
     */
    $event(EventClass, name) {
        if (!name) {
            name = EventClass.name;
        }
        const event = new EventEmitter(EventClass);
        return this.$register(event, name);
    }
    /**
     * Registers an EventEmitter so it can be called by name.
     * @param event
     * @param name
     */
    $register(event, name) {
        // Register new
        if (!(name in this.$byName)) {
            this.$byName[name] = event;
            return event;
        }
        // Update existing
        const existing = this.$byName[name];
        if (!existing.type && event.type) {
            existing.type = event.type;
        }
        return event;
    }
    /**
     * Listen to event based on a runtime-defined string.
     * If `allowDynamicEvents` is `true`, the event can be listened to even if it does not exist yet.
     * @param {string} EventClass
     * @param {callback} callback
     */
    $on(EventClass, callback) {
        const eventEmitter = this.$get(EventClass);
        eventEmitter.on(event => {
            if (!(event instanceof EventClass)) {
                log.error(`Expected '${EventClass.name}', but got:`, event);
                throw new Error(`Expected '${EventClass.name}'.`);
            }
            callback(event);
        });
    }
    /**
     * Stop listening to event based on a runtime-defined string.
     * @param event
     * @param callback
     */
    $off(event, callback) {
        const Ievent = this.$get(event);
        Ievent.off(callback);
    }
    /**
     * Fire event based on a runtime-defined string.
     * @param event
     * @param payload
     */
    $fire(event, payload) {
        let eventEmitter;
        // Single-argument event firing
        if (_.isObject(event)) {
            eventEmitter = this.$get(event.constructor);
            eventEmitter.fire(event);
            return;
        }
        // Event name with payload
        eventEmitter = this.$get(event);
        eventEmitter.fire(payload);
    }
    /**
     * Gets an event based on a runtime-defined string.
     * If the event is not predefined, and the Events instance allows dynamic events, it will create the event.
     * @param event
     */
    $get(event) {
        event = Events.getEventName(event);
        if (!(event in this.$byName)) {
            if (!this.$allowDynamicEvents) {
                throw new Error(`Unknown event '${event}'.`);
            }
            // Define event on the fly
            this.$byName[event] = new EventEmitter();
        }
        return this.$byName[event];
    }
}
exports.Events = Events;
//# sourceMappingURL=EventEmitter.js.map