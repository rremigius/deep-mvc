import EventEmitter, { callback } from "./EventEmitter";
/**
 * A class that can listen to an event, and can remove itself from the event when it stops listening.
 */
export default class EventListener<T> {
    private readonly event;
    private readonly callback;
    constructor(event: EventEmitter<T>, callback: callback<T>);
    start(): void;
    stop(): void;
}
