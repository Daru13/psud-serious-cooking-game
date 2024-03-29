export type EventID = string;

export interface Event {
	readonly id: EventID;
}

export type EventHandler<E extends Event> = (event: E) => void;

export class EventManager {
	private static eventHandlers: Map<EventID, EventHandler<any>[]> = new Map();

    static emit(event: Event): void {
		let eventID = event.id;

		if (! EventManager.eventHandlers.has(eventID)) {
			return;
		}

		let handlers = EventManager.eventHandlers.get(eventID);
		for (let handler of handlers) {
			handler(event);
		}
	}

    static registerHandler<E extends Event>(event: { readonly id: EventID }, handler: EventHandler<E>): void {
		if (! EventManager.eventHandlers.has(event.id)) {
			EventManager.eventHandlers.set(event.id, []);
		}

		let handlers = EventManager.eventHandlers.get(event.id);
		handlers.push(handler);
    }
    
	static unregisterHandler<E extends Event>(event: { readonly id: EventID }, handler: EventHandler<E>): void {
		let handlers = EventManager.eventHandlers.get(event.id);
		let handlerIndex = handlers.indexOf(handler);

		if (handlerIndex >= 0) {
			handlers.splice(handlerIndex, 1);
		}

		if (handlers.length === 0) {
			EventManager.eventHandlers.delete(event.id);
		}
	}
}
