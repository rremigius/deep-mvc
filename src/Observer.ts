import Vue from 'vue';
import { isFunction, forEach } from 'lodash';

export type Handler = (newValue?:any, oldValue?:any)=>void;
export type WatcherObject = {
	watch:()=>any,
	handler:Handler,
	deep?:boolean,
	immediate?:boolean
};
export type Watcher = Handler|WatcherObject;

function isHandler(value:any):value is Handler {
	return isFunction(value);
}

export default class Observer {
	vue:Vue;
	constructor(target:Object, watchers:Record<string,Watcher>) {
		const modelWatchers:Record<string, Watcher> = {};
		const computed:Record<string,()=>any> = {};

		forEach(watchers, (watcher:Watcher, key:string) => {
			if(isHandler(watcher)) {
				// Prepend 'target.' before each key, to match the Vue data
				modelWatchers['target.'+key] = watchers[key];
				return;
			}
			modelWatchers[key] = watcher;
			computed[key] = watcher.watch;
		});
		// Create Vue Observer class
		const ObserverVue = Vue.extend({
			data:()=>({
				target
			}),
			computed,
			watch: modelWatchers
		});

		this.vue = new ObserverVue();
	}
}
