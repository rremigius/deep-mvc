"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const event_interface_mixin_1 = tslib_1.__importDefault(require("event-interface-mixin"));
class EventBus extends event_interface_mixin_1.default {
    constructor() {
        super(true);
    }
}
exports.default = EventBus;
//# sourceMappingURL=EventBus.js.map