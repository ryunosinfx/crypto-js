/**
 * A noop padding strategy.
 */
class NoPadding {
	static pad = () => {};
	static unpad = () => {};
}
CryptoJS.pad.NoPadding = NoPadding;
