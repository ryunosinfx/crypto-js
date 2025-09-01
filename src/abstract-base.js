/**
 * Base object for prototypal inheritance.
 */
export class Base {
	/**
	 * Creates a new object that inherits from this object.
	 *
	 * @param {Object} overrides Properties to copy into the new object.
	 *
	 * @return {Object} The new object.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const MyType = CryptoJS.lib.Base.extend({
	 *         field: 'value',
	 *
	 *         method: function () {
	 *         }
	 *     });
	 */
	extend(overrides) {
		const subtype = new Base(); //(this); // Spawn
		if (overrides) Base.mixIn(subtype, overrides); // Augment
		// Create default initializer
		if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
			subtype.init = function () {
				subtype.$super.init.apply(this, arguments);
			};
		}
		subtype.init.prototype = subtype; // Initializer's prototype is the subtype object
		subtype.$super = this; // Reference supertype
		return subtype;
	}

	/**
	 * Extends this object and runs the init method.
	 * Arguments to new() will be passed to init().
	 *
	 * @return {Object} The new object.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const instance = new MyType();
	 */
	// static c reate() {
	// 	const instance = new Base();
	// 	instance.init.apply(instance, arguments);
	// 	return instance;
	// }

	/**
	 * Initializes a newly created object.
	 * Override this method to add some logic when your objects are created.
	 *
	 * @example
	 *
	 *     const MyType = CryptoJS.lib.Base.extend({
	 *         init: function () {
	 *             // ...
	 *         }
	 *     });
	 */
	constructor() {
		this.cfg = {};
	}

	/**
	 * Copies properties into this object.
	 *
	 * @param {Object} properties The properties to mix in.
	 *
	 * @example
	 *
	 *     MyType.mixIn({
	 *         field: 'value'
	 *     });
	 */
	static mixIn = (base, properties) => {
		if (!properties) return base;
		for (const name in properties) base[name] = properties[name];
		if (properties.hasOwnProperty('toString')) base.toString = properties.toString; // IE won't copy toString using the loop above
		return base;
	};

	/**
	 * Creates a copy of this object.
	 *
	 * @return {Object} The clone.
	 *
	 * @example
	 *
	 *     const clone = instance.clone();
	 */
	clone() {
		// return this.init.prototype.extend(this);
		const newOne = new this.constructor();

		for (const key in this) {
			const value = this[key];
			newOne[key] = value === undefined ? undefined : JSON.parse(JSON.stringify(value)); //structuredClone(this[key]);
		}
		return newOne;
	}
}
