(function () {
	// Shortcuts
	const C = CryptoJS;
	const C_lib = C.lib;
	const WordArray = C_lib.WordArray;
	const C_enc = C.enc;

	/**
	 * UTF-16 BE encoding strategy.
	 */
	const Utf16BE = {
		/**
		 * Converts a word array to a UTF-16 BE string.
		 *
		 * @param {WordArray} wordArray The word array.
		 *
		 * @return {string} The UTF-16 BE string.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     const utf16String = CryptoJS.enc.Utf16.stringify(wordArray);
		 */
		stringify: wordArray => {
			const words = wordArray.words; // Shortcuts
			const sigBytes = wordArray.sigBytes; // Shortcuts
			const utf16Chars = []; // Convert
			for (let i = 0; i < sigBytes; i += 2)
				utf16Chars.push(String.fromCharCode((words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff));
			return utf16Chars.join('');
		},

		/**
		 * Converts a UTF-16 BE string to a word array.
		 *
		 * @param {string} utf16Str The UTF-16 BE string.
		 *
		 * @return {WordArray} The word array.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     const wordArray = CryptoJS.enc.Utf16.parse(utf16String);
		 */
		parse: utf16Str => {
			const utf16StrLength = utf16Str.length; // Shortcut
			const words = []; // Convert
			for (let i = 0; i < utf16StrLength; i++) words[i >>> 1] |= utf16Str.charCodeAt(i) << (16 - (i % 2) * 16);
			return WordArray.create(words, utf16StrLength * 2);
		},
	};
	C_enc.Utf16 = Utf16BE; // Alias for UTF-16 BE
	C_enc.Utf16BE = Utf16BE; // Alias for UTF-16 BE
	/**
	 * UTF-16 LE encoding strategy.
	 */
	C_enc.Utf16LE = {
		/**
		 * Converts a word array to a UTF-16 LE string.
		 *
		 * @param {WordArray} wordArray The word array.
		 *
		 * @return {string} The UTF-16 LE string.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     const utf16Str = CryptoJS.enc.Utf16LE.stringify(wordArray);
		 */
		stringify: wordArray => {
			const words = wordArray.words; // Shortcuts
			const sigBytes = wordArray.sigBytes; // Shortcuts

			const utf16Chars = []; // Convert
			for (let i = 0; i < sigBytes; i += 2) {
				const codePoint = swapEndian((words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff);
				utf16Chars.push(String.fromCharCode(codePoint));
			}

			return utf16Chars.join('');
		},

		/**
		 * Converts a UTF-16 LE string to a word array.
		 *
		 * @param {string} utf16Str The UTF-16 LE string.
		 *
		 * @return {WordArray} The word array.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     const wordArray = CryptoJS.enc.Utf16LE.parse(utf16Str);
		 */
		parse: utf16Str => {
			const utf16StrLength = utf16Str.length; // Shortcut
			const words = []; // Convert
			for (let i = 0; i < utf16StrLength; i++)
				words[i >>> 1] |= swapEndian(utf16Str.charCodeAt(i) << (16 - (i % 2) * 16));
			return WordArray.create(words, utf16StrLength * 2);
		},
	};
	const swapEndian = word => ((word << 8) & 0xff00ff00) | ((word >>> 8) & 0x00ff00ff);
})();
