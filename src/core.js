/*globals window, global, require*/

/**
 * CryptoJS core components.
 */
var CryptoJS =
	CryptoJS ||
	(function (Math, undefined) {
		let crypto =
			// Native crypto from window (Browser)
			typeof window !== 'undefined' && window.crypto
				? window.crypto
				: typeof self !== 'undefined' && self.crypto // Native crypto in web worker (Browser)
				? self.crypto
				: typeof globalThis !== 'undefined' && globalThis.crypto // Native crypto from worker
				? globalThis.crypto
				: typeof window !== 'undefined' && window.msCrypto // Native (experimental IE 11) crypto from window (Browser)
				? window.msCrypto
				: typeof global !== 'undefined' && global.crypto // Native crypto from global (NodeJS)
				? global.crypto
				: undefined;

		// Native crypto import via require (NodeJS)
		if (!crypto && typeof require === 'function') {
			try {
				crypto = require('crypto');
			} catch (err) {}
		}

		/*
		 * Cryptographically secure pseudorandom number generator
		 *
		 * As Math.random() is cryptographically not safe to use
		 */
		const cryptoSecureRandomInt = function () {
			if (crypto) {
				// Use getRandomValues method (Browser)
				if (typeof crypto.getRandomValues === 'function') {
					try {
						return crypto.getRandomValues(new Uint32Array(1))[0];
					} catch (err) {}
				}

				// Use randomBytes method (NodeJS)
				if (typeof crypto.randomBytes === 'function') {
					try {
						return crypto.randomBytes(4).readInt32LE();
					} catch (err) {}
				}
			}

			throw new Error('Native crypto module could not be used to get secure random number.');
		};

		/** Local polyfill of Object.create*/
		const create =
			Object.create ||
			(function () {
				function F() {}
				return obj => {
					F.prototype = obj;
					const subtype = new F();
					F.prototype = null;
					return subtype;
				};
			})();

		/**
		 * CryptoJS namespace.
		 */
		const C = { lib: {}, algo: {}, enc: {}, x64: {}, pad: {}, mode: {} };

		/**
		 * Library namespace.
		 */
		const C_lib = C.lib;

		/**
		 * Base object for prototypal inheritance.
		 */
		const Base = (function () {
			return {
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
				extend: function (overrides) {
					const subtype = create(this); // Spawn
					if (overrides) subtype.mixIn(overrides); // Augment
					// Create default initializer
					if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
						subtype.init = function () {
							subtype.$super.init.apply(this, arguments);
						};
					}
					subtype.init.prototype = subtype; // Initializer's prototype is the subtype object
					subtype.$super = this; // Reference supertype
					return subtype;
				},

				/**
				 * Extends this object and runs the init method.
				 * Arguments to create() will be passed to init().
				 *
				 * @return {Object} The new object.
				 *
				 * @static
				 *
				 * @example
				 *
				 *     const instance = MyType.create();
				 */
				create: function () {
					const instance = this.extend();
					instance.init.apply(instance, arguments);
					return instance;
				},

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
				init: function () {},

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
				mixIn: function (properties) {
					for (const propertyName in properties)
						if (properties.hasOwnProperty(propertyName)) this[propertyName] = properties[propertyName];
					if (properties.hasOwnProperty('toString')) this.toString = properties.toString; // IE won't copy toString using the loop above
				},

				/**
				 * Creates a copy of this object.
				 *
				 * @return {Object} The clone.
				 *
				 * @example
				 *
				 *     const clone = instance.clone();
				 */
				clone: function () {
					return this.init.prototype.extend(this);
				},
			};
		})();
		C_lib.Base = Base; // Export Base
		/**
		 * An array of 32-bit words.
		 *
		 * @property {Array} words The array of 32-bit words.
		 * @property {number} sigBytes The number of significant bytes in this word array.
		 */
		const WordArray = Base.extend({
			/**
			 * Initializes a newly created word array.
			 *
			 * @param {Array} words (Optional) An array of 32-bit words.
			 * @param {number} sigBytes (Optional) The number of significant bytes in the words.
			 *
			 * @example
			 *
			 *     const wordArray = CryptoJS.lib.WordArray.create();
			 *     const wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
			 *     const wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
			 */
			init: function (words, sigBytes) {
				const wordsInit = (this.words = words || []);
				this.sigBytes = sigBytes != undefined ? sigBytes : wordsInit.length * 4;
			},

			/**
			 * Converts this word array to a string.
			 *
			 * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
			 *
			 * @return {string} The stringified word array.
			 *
			 * @example
			 *
			 *     const string = wordArray + '';
			 *     const string = wordArray.toString();
			 *     const string = wordArray.toString(CryptoJS.enc.Utf8);
			 */
			toString: function (encoder) {
				return (encoder || Hex).stringify(this);
			},

			/**
			 * Concatenates a word array to this word array.
			 *
			 * @param {WordArray} wordArray The word array to append.
			 *
			 * @return {WordArray} This word array.
			 *
			 * @example
			 *
			 *     wordArray1.concat(wordArray2);
			 */
			concat: function (wordArray) {
				// Shortcuts
				const thisWords = this.words;
				const thatWords = wordArray.words;
				const thisSigBytes = this.sigBytes;
				const thatSigBytes = wordArray.sigBytes;
				this.clamp(); // Clamp excess bits
				// Concat
				if (thisSigBytes % 4) {
					// Copy one byte at a time
					for (let i = 0; i < thatSigBytes; i++) {
						const thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
						thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
					}
				} else
					for (let j = 0; j < thatSigBytes; j += 4) thisWords[(thisSigBytes + j) >>> 2] = thatWords[j >>> 2]; // Copy one word at a time
				this.sigBytes += thatSigBytes;
				return this; // Chainable
			},

			/**
			 * Removes insignificant bits.
			 *
			 * @example
			 *
			 *     wordArray.clamp();
			 */
			clamp: function () {
				// Shortcuts
				const words = this.words;
				const sigBytes = this.sigBytes;

				// Clamp
				words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
				words.length = Math.ceil(sigBytes / 4);
			},

			/**
			 * Creates a copy of this word array.
			 *
			 * @return {WordArray} The clone.
			 *
			 * @example
			 *
			 *     const clone = wordArray.clone();
			 */
			clone: function () {
				const clone = Base.clone.call(this);
				clone.words = this.words.slice(0);
				return clone;
			},

			/**
			 * Creates a word array filled with random bytes.
			 *
			 * @param {number} nBytes The number of random bytes to generate.
			 *
			 * @return {WordArray} The random word array.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     const wordArray = CryptoJS.lib.WordArray.random(16);
			 */
			random: function (nBytes) {
				const words = [];
				for (let i = 0; i < nBytes; i += 4) words.push(cryptoSecureRandomInt());
				return new WordArray.init(words, nBytes);
			},
		});
		C_lib.WordArray = WordArray; // Export WordArray
		/////////////////////////////////////////////////////////////////////////////////////////
		/**
		 * Hex encoding strategy.
		 */
		const Hex = {
			/**
			 * Converts a word array to a hex string.
			 *
			 * @param {WordArray} wordArray The word array.
			 *
			 * @return {string} The hex string.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     const hexString = CryptoJS.enc.Hex.stringify(wordArray);
			 */
			stringify: function (wordArray) {
				const words = wordArray.words; // Shortcuts
				const sigBytes = wordArray.sigBytes; // Shortcuts
				const hexChars = []; // Convert
				for (let i = 0; i < sigBytes; i++) {
					const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
					hexChars.push((bite >>> 4).toString(16));
					hexChars.push((bite & 0x0f).toString(16));
				}
				return hexChars.join('');
			},

			/**
			 * Converts a hex string to a word array.
			 *
			 * @param {string} hexStr The hex string.
			 *
			 * @return {WordArray} The word array.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     const wordArray = CryptoJS.enc.Hex.parse(hexString);
			 */
			parse: function (hexStr) {
				const hexStrLength = hexStr.length; // Shortcut
				const words = []; // Convert
				for (let i = 0; i < hexStrLength; i += 2)
					words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
				return new WordArray.init(words, hexStrLength / 2);
			},
		};

		/**
		 * Latin1 encoding strategy.
		 */
		const Latin1 = {
			/**
			 * Converts a word array to a Latin1 string.
			 *
			 * @param {WordArray} wordArray The word array.
			 *
			 * @return {string} The Latin1 string.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     const latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
			 */
			stringify: function (wordArray) {
				const words = wordArray.words; // Shortcuts
				const sigBytes = wordArray.sigBytes; // Shortcuts
				const latin1Chars = []; // Convert
				for (let i = 0; i < sigBytes; i++) {
					const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
					latin1Chars.push(String.fromCharCode(bite));
				}
				return latin1Chars.join('');
			},

			/**
			 * Converts a Latin1 string to a word array.
			 *
			 * @param {string} latin1Str The Latin1 string.
			 *
			 * @return {WordArray} The word array.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     const wordArray = CryptoJS.enc.Latin1.parse(latin1String);
			 */
			parse: function (latin1Str) {
				const latin1StrLength = latin1Str.length; // Shortcut
				const words = []; // Convert
				for (let i = 0; i < latin1StrLength; i++)
					words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
				return new WordArray.init(words, latin1StrLength);
			},
		};

		/**
		 * UTF-8 encoding strategy.
		 */
		const Utf8 = {
			/**
			 * Converts a word array to a UTF-8 string.
			 *
			 * @param {WordArray} wordArray The word array.
			 *
			 * @return {string} The UTF-8 string.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     const utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
			 */
			stringify: function (wordArray) {
				try {
					return decodeURIComponent(escape(Latin1.stringify(wordArray)));
				} catch (e) {
					throw new Error('Malformed UTF-8 data');
				}
			},

			/**
			 * Converts a UTF-8 string to a word array.
			 *
			 * @param {string} utf8Str The UTF-8 string.
			 *
			 * @return {WordArray} The word array.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     const wordArray = CryptoJS.enc.Utf8.parse(utf8String);
			 */
			parse: function (utf8Str) {
				return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
			},
		};

		/**
		 * Encoder namespace.
		 */
		const C_enc = { Utf8, Latin1, Hex }; // Create C_enc namespace
		C.enc = C_enc; // Export C_enc
		/**
		 * Abstract buffered block algorithm template.
		 *
		 * The property blockSize must be implemented in a concrete subtype.
		 *
		 * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
		 */
		const BufferedBlockAlgorithm = Base.extend({
			/**
			 * Resets this block algorithm's data buffer to its initial state.
			 *
			 * @example
			 *
			 *     bufferedBlockAlgorithm.reset();
			 */
			reset: function () {
				this._data = new WordArray.init(); // Initial values
				this._nDataBytes = 0;
			},

			/**
			 * Adds new data to this block algorithm's buffer.
			 *
			 * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
			 *
			 * @example
			 *
			 *     bufferedBlockAlgorithm._append('data');
			 *     bufferedBlockAlgorithm._append(wordArray);
			 */
			_append: function (data) {
				if (typeof data == 'string') data = Utf8.parse(data); // Convert string to WordArray, else assume WordArray already
				this._data.concat(data); // Append
				this._nDataBytes += data.sigBytes;
			},

			/**
			 * Processes available data blocks.
			 *
			 * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
			 *
			 * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
			 *
			 * @return {WordArray} The processed data.
			 *
			 * @example
			 *
			 *     const processedData = bufferedBlockAlgorithm._process();
			 *     const processedData = bufferedBlockAlgorithm._process(!!'flush');
			 */
			_process: function (doFlush) {
				let processedWords;

				// Shortcuts
				const data = this._data;
				const dataWords = data.words;
				const dataSigBytes = data.sigBytes;
				const blockSize = this.blockSize;
				const blockSizeBytes = blockSize * 4;

				// Count blocks ready
				const nBlocksReadyPre = dataSigBytes / blockSizeBytes;
				const nBlocksReady = doFlush // Round up to include partial blocks
					? Math.ceil(nBlocksReadyPre)
					: // Round down to include only full blocks,
					  // less the number of blocks that must remain in the buffer
					  Math.max((nBlocksReadyPre | 0) - this._minBufferSize, 0);
				const nWordsReady = nBlocksReady * blockSize; // Count words ready
				const nBytesReady = Math.min(nWordsReady * 4, dataSigBytes); // Count bytes ready
				// Process blocks
				if (nWordsReady) {
					for (let offset = 0; offset < nWordsReady; offset += blockSize)
						this._doProcessBlock(dataWords, offset); // Perform concrete-algorithm logic
					// Remove processed words
					processedWords = dataWords.splice(0, nWordsReady);
					data.sigBytes -= nBytesReady;
				}
				return new WordArray.init(processedWords, nBytesReady); // Return processed words
			},

			/**
			 * Creates a copy of this object.
			 *
			 * @return {Object} The clone.
			 *
			 * @example
			 *
			 *     const clone = bufferedBlockAlgorithm.clone();
			 */
			clone: function () {
				const clone = Base.clone.call(this);
				clone._data = this._data.clone();
				return clone;
			},

			_minBufferSize: 0,
		});
		C_lib.BufferedBlockAlgorithm = BufferedBlockAlgorithm; // Export BufferedBlockAlgorithm

		/**
		 * Abstract hasher template.
		 *
		 * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
		 */
		const Hasher = BufferedBlockAlgorithm.extend({
			/**
			 * Configuration options.
			 */
			cfg: Base.extend(),

			/**
			 * Initializes a newly created hasher.
			 *
			 * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
			 *
			 * @example
			 *
			 *     const hasher = CryptoJS.algo.SHA256.create();
			 */
			init: function (cfg) {
				this.cfg = this.cfg.extend(cfg); // Apply config defaults
				this.reset(); // Set initial values
			},

			/**
			 * Resets this hasher to its initial state.
			 *
			 * @example
			 *
			 *     hasher.reset();
			 */
			reset: function () {
				BufferedBlockAlgorithm.reset.call(this); // Reset data buffer
				this._doReset(); // Perform concrete-hasher logic
			},

			/**
			 * Updates this hasher with a message.
			 *
			 * @param {WordArray|string} messageUpdate The message to append.
			 *
			 * @return {Hasher} This hasher.
			 *
			 * @example
			 *
			 *     hasher.update('message');
			 *     hasher.update(wordArray);
			 */
			update: function (messageUpdate) {
				this._append(messageUpdate); // Append
				this._process(); // Update the hash
				return this; // Chainable
			},

			/**
			 * Finalizes the hash computation.
			 * Note that the finalize operation is effectively a destructive, read-once operation.
			 *
			 * @param {WordArray|string} messageUpdate (Optional) A final message update.
			 *
			 * @return {WordArray} The hash.
			 *
			 * @example
			 *
			 *     const hash = hasher.finalize();
			 *     const hash = hasher.finalize('message');
			 *     const hash = hasher.finalize(wordArray);
			 */
			finalize: function (messageUpdate) {
				if (messageUpdate) this._append(messageUpdate); // Final message update
				return this._doFinalize(); // Perform concrete-hasher logic
			},

			blockSize: 512 / 32,

			/**
			 * Creates a shortcut function to a hasher's object interface.
			 *
			 * @param {Hasher} hasher The hasher to create a helper for.
			 *
			 * @return {Function} The shortcut function.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     const SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
			 */
			_createHelper: function (hasher) {
				return (message, cfg) => new hasher.init(cfg).finalize(message);
			},

			/**
			 * Creates a shortcut function to the HMAC's object interface.
			 *
			 * @param {Hasher} hasher The hasher to use in this HMAC helper.
			 *
			 * @return {Function} The shortcut function.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     const HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
			 */
			_createHmacHelper: function (hasher) {
				return (message, key) => new C_algo.HMAC.init(hasher, key).finalize(message);
			},
		});
		C_lib.Hasher = Hasher; // Export Hasher
		/**
		 * Algorithm namespace.
		 */
		const C_algo = C.algo;

		return C;
	})(Math);
