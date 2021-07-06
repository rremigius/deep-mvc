"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A class that can listen to an event, and can remove itself from the event when it stops listening.
 */
class EventListener {
    constructor(event, callback) {
        this.event = event;
        this.callback = callback;
    }
    start() {
        this.event.on(this.callback);
    }
    stop() {
        this.event.off(this.callback);
    }
}
exports.default = EventListener;
//# sourceMappingURL=EventListener.js.map