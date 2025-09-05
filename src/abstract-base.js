/**
 * Base object for prototypal inheritance.
 */
export class Base {
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
	static mixInAsNew = (base, properties) => Base.mixIn(Base.mixIn({}, base), properties);

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
		const newOne = new this.constructor();

		for (const key in this) {
			const value = this[key];
			newOne[key] = value === undefined ? undefined : JSON.parse(JSON.stringify(value)); //structuredClone(this[key]);
		}
		return newOne; // return this.init.prototype.extend(this);
	}
}
