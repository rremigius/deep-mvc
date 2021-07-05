import { Alphanumeric, Class, Constructor } from "validation-kit";
export declare type TypeClass<T> = Constructor<T> | String | Number | Boolean | Alphanumeric;
export declare type callback<T> = (payload: T) => void;
export default class EventEmitter<T> {
    private listeners;
    type?: TypeClass<T>;
    constructor(runtimeType?: TypeClass<T>);
    listenerCount(): number;
    on(listener: callback<T>): callback<T>;
    off(listener: callback<T>): void;
    fire(event: T): void;
    private isCorrectType;
}
export declare class Events {
    private readonly $allowDynamicEvents;
    private readonly $byName;
    static getEventName(event: string | Function): string;
    constructor(allowDynamicEvents?: boolean);
    /**
     * Creates an EventEmitter and registers it.
     * @param EventClass
     * @param name
     */
    $event<T>(EventClass: Constructor<T>, name?: string): EventEmitter<T>;
    /**
     * Registers an EventEmitter so it can be called by name.
     * @param event
     * @param name
     */
    $register<T>(event: EventEmitter<T>, name: string): EventEmitter<T>;
    /**
     * Listen to event based on a runtime-defined string.
     * If `allowDynamicEvents` is `true`, the event can be listened to even if it does not exist yet.
     * @param {string} EventClass
     * @param {callback} callback
     */
    $on<T>(EventClass: Constructor<T>, callback: callback<T>): void;
    /**
     * Stop listening to event based on a runtime-defined string.
     * @param event
     * @param callback
     */
    $off(event: string | Class, callback: callback<unknown>): void;
    /**
     * Fire event based on a runtime-defined string.
     * @param event
     * @param payload
     */
    $fire<T extends object>(event: string | T, payload?: unknown): void;
    /**
     * Gets an event based on a runtime-defined string.
     * If the event is not predefined, and the Events instance allows dynamic events, it will create the event.
     * @param event
     */
    $get(event: string | Function): EventEmitter<unknown>;
}
