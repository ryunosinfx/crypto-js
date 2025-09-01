import { Hex } from './enc-hex.js';
import { CipherParams } from './cipher-params.js';
export class HexFormatter {
	/**
	 * Converts the ciphertext of a cipher params object to a hexadecimally encoded string.
	 *
	 * @param {CipherParams} cipherParams The cipher params object.
	 *
	 * @return {string} The hexadecimally encoded string.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const hexString = CryptoJS.format.Hex.stringify(cipherParams);
	 */
	static stringify = cipherParams => cipherParams.ciphertext.toString(Hex);

	/**
	 * Converts a hexadecimally encoded ciphertext string to a cipher params object.
	 *
	 * @param {string} input The hexadecimally encoded string.
	 *
	 * @return {CipherParams} The cipher params object.
	 *
	 * @static
	 *
	 * @example
	 *
	 *     const cipherParams = CryptoJS.format.Hex.parse(hexString);
	 */
	static parse = input => new CipherParams({ ciphertext: Hex.parse(input) });
}
