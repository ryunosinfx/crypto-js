(function () {
	// Shortcuts
	const C = CryptoJS;
	const C_lib = C.lib;
	const WordArray = C_lib.WordArray;

	/**
	 * Base64url encoding strategy.
	 */
	class Base64url {
		static _map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
		static _safe_map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
		static _reverseMap = []; // Reverse map for Base64url decoding
		static _safe_reverseMap = []; // Reverse map for Base64url decoding
		/**
		 * Converts a word array to a Base64url string.
		 *
		 * @param {WordArray} wordArray The word array.
		 *
		 * @param {boolean} urlSafe Whether to use url safe
		 *
		 * @return {string} The Base64url string.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     const base64String = CryptoJS.enc.Base64url.stringify(wordArray);
		 */
		static stringify = (wordArray, urlSafe = true) => {
			const words = wordArray.words; // Shortcuts
			const sigBytes = wordArray.sigBytes; // Shortcuts
			const map = urlSafe ? Base64url._safe_map : Base64url._map; // Shortcuts
			wordArray.clamp(); // Clamp excess bits
			// Convert
			const base64Chars = [];
			for (let i = 0; i < sigBytes; i += 3) {
				const byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
				const byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
				const byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;
				const triplet = (byte1 << 16) | (byte2 << 8) | byte3;
				for (let j = 0; j < 4 && i + j * 0.75 < sigBytes; j++)
					base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
			}
			const paddingChar = map.charAt(64); // Add padding
			if (paddingChar) while (base64Chars.length % 4) base64Chars.push(paddingChar);
			return base64Chars.join('');
		};

		/**
		 * Converts a Base64url string to a word array.
		 *
		 * @param {string} base64Str The Base64url string.
		 *
		 * @param {boolean} urlSafe Whether to use url safe
		 *
		 * @return {WordArray} The word array.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     const wordArray = CryptoJS.enc.Base64url.parse(base64String);
		 */
		static parse = (base64Str, urlSafe = true) => {
			const map = urlSafe ? Base64url._safe_map : Base64url._map; // Shortcuts
			const reverseMap = urlSafe ? Base64url._safe_reverseMap : Base64url._reverseMap; // Shortcuts
			const paddingChar = map.charAt(64); // Ignore padding
			const paddingIndex = paddingChar ? base64Str.indexOf(paddingChar) : -1;
			const base64StrLength = paddingIndex !== -1 ? paddingIndex : base64Str.length;
			return parseLoop(base64Str, base64StrLength, reverseMap); // Convert
		};
		static init = () => {
			// Initialize reverse map if not already done
			const map = Base64url._map;
			const smap = Base64url._safe_map;
			const ml = map.length;
			const sl = smap.length;
			const rm = Base64url._reverseMap;
			const sm = Base64url._safe_reverseMap;
			for (let j = 0; j < ml; j++) rm[map.charCodeAt(j)] = j;
			for (let j = 0; j < sl; j++) sm[smap.charCodeAt(j)] = j;
		};

		static parseLoop = (base64Str, base64StrLength, reverseMap) => {
			const words = [];
			let nBytes = 0;
			for (let i = 0; i < base64StrLength; i++)
				if (i % 4) {
					const bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
					const bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
					const bitsCombined = bits1 | bits2;
					words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes % 4) * 8);
					nBytes++;
				}
			return WordArray.create(words, nBytes);
		};
	}
	Base64url.init();
	C.enc.Base64url = Base64url;
})();
