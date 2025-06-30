(function (undefined) {
	// Shortcuts
	const C = CryptoJS;
	const C_lib = C.lib;
	const CipherParams = C_lib.CipherParams;
	const C_enc = C.enc;
	const Hex = C_enc.Hex;
	class HexFormatter {
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
		static parse = input => CipherParams.create({ ciphertext: Hex.parse(input) });
	}
	C.format.Hex = HexFormatter;
})();
