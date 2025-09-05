import { CryptoJS as C } from './core.js';
import { Base } from './abstract-base.js';
import { StreamCipher } from './abstract-stream-cipher.js';
/**
 * RC4 stream cipher algorithm.
 */
export class RC4 extends StreamCipher {
	static keySize = 256 / 32;
	static ivSize = 0;
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.keySize = RC4.keySize;
		this.ivSize = RC4.ivSize;
		this.cfg = Base.mixIn(this.cfg, { keySize: this.keySize, ivSize: this.ivSize, blockSize: this.blockSize });
		this.reset();
	}

	_doReset() {
		const key = this._key; // Shortcuts
		const keyWords = key.words; // Shortcuts
		const keySigBytes = key.sigBytes; // Shortcuts
		const S = []; // Init sbox
		for (let i = 0; i < 256; i++) S[i] = i;
		// Key setup
		for (let i = 0, j = 0; i < 256; i++) {
			const keyByteIndex = i % keySigBytes;
			const keyByte = (keyWords[keyByteIndex >>> 2] >>> (24 - (keyByteIndex % 4) * 8)) & 0xff;
			j = (j + S[i] + keyByte) % 256;
			const t = S[i]; // Swap
			S[i] = S[j]; // Swap
			S[j] = t; // Swap
		}
		this._S = S;
		this._i = this._j = 0; // Counters
	}

	_doProcessBlock(M, offset) {
		M[offset] ^= this.generateKeystreamWord();
	}

	generateKeystreamWord() {
		const S = this._S; // Shortcuts
		let i = this._i; // Shortcuts
		let j = this._j; // Shortcuts
		let keystreamWord = 0; // Generate keystream word
		for (let n = 0; n < 4; n++) {
			i = (i + 1) % 256;
			j = (j + S[i]) % 256;
			const t = S[i]; // Swap
			S[i] = S[j];
			S[j] = t;
			keystreamWord |= S[(S[i] + S[j]) % 256] << (24 - n * 8);
		}
		this._i = i; // Update counters
		this._j = j; // Update counters
		return keystreamWord;
	}
}

/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     const ciphertext = CryptoJS.RC4.encrypt(message, key, cfg);
 *     const plaintext  = CryptoJS.RC4.decrypt(ciphertext, key, cfg);
 */
C.RC4 = StreamCipher._createHelper(RC4);

/**
 * Modified RC4 stream cipher algorithm.
 */
export class RC4Drop extends RC4 {
	static defaultConf = {
		drop: 192,
	};
	/**
	 * Configuration options.
	 *
	 * @property {number} drop The number of keystream words to drop. Default 192
	 */
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, RC4Drop.defaultConf);
	}
	_doReset() {
		super._doReset();
		for (let i = this.cfg.drop; i > 0; i--) this.generateKeystreamWord(); // Drop
	}
}

/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     const ciphertext = CryptoJS.RC4Drop.encrypt(message, key, cfg);
 *     const plaintext  = CryptoJS.RC4Drop.decrypt(ciphertext, key, cfg);
 */
C.RC4Drop = StreamCipher._createHelper(RC4Drop);
