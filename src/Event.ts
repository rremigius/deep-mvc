type callback<T> = (payload:T)=>void
export default class Event<T> {
	listeners:callback<T>[] = [];

	on(listener:callback<T>) {
		this.listeners.push(listener);
	}

	off(listener:callback<T>) {
		this.listeners.splice(this.listeners.indexOf(listener),1);
	}

	fire(event:T) {
		this.listeners.forEach(listener => {
			listener(event);
		});
	}
}
