import {assert} from "chai";

import View from "../src/View";
import {alphanumeric} from "mozel";
import { remove } from 'lodash';
import ViewModel from "../src/View/ViewModel";

describe("View", () => {
	describe("onViewAdd/onViewRemove", () => {
		it("are called whenever a child view is added/removed.", () => {
			const modelA = ViewModel.create<ViewModel>({gid: 'a'});
			const modelB = ViewModel.create<ViewModel>({gid: 'b'});
			const modelC = ViewModel.create<ViewModel>({gid: 'c'});

			class FooView extends View {
				foos:alphanumeric[] = [];
				onViewAdd(view: View) {
					super.onViewAdd(view);
					this.foos.push(view.gid);
				}
				onViewRemove(view: View) {
					super.onViewRemove(view);
					remove(this.foos, i => i === view.gid);
				}
			}

			const factory = FooView.createFactory();
			const viewA = factory.create(modelA, FooView);

			modelA.children.add(modelB);
			modelA.children.add(modelC);

			assert.deepEqual(viewA.foos, ['b', 'c']);

			modelA.children.remove(modelB);
			modelA.children.remove(modelC);

			assert.deepEqual(viewA.foos, []);
		});
	});
});
