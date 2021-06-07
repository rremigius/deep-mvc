import Mozel, {property, required} from "mozel"

/**
 * A class to make a distinction between simple mozels and component mozels.
 * This can be useful when, for example, assigning event sources or action targets to triggers,
 * which don't make sense unless there is a Component handling the Mozel.
 */
export default class BaseComponentModel extends Mozel {
	static get type() { return 'Component' };

	@property(Boolean, {required, default: true})
	enabled!:boolean;
}
