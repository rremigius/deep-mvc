import Mozel from "mozel"

/**
 * A class to make a distinction between simple mozels and controller mozels.
 * This can be useful when, for example, assigning event sources or action targets to triggers,
 * which don't make sense unless there is a Controller handling the Mozel.
 */
export default class ControllerModel extends Mozel {
	static get type() { return 'Controller' };
}
