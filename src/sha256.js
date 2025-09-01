import { CryptoJS } from './core.js';
import { WordArray } from './word-array.js';
import { Hasher } from './abstract-hasher.js';
// Shortcuts
const C = CryptoJS;

// Initialization and round constants tables
const H = [];
const K = [];

// Compute constants

const isPrime = n => {
	const sqrtN = Math.sqrt(n);
	for (let factor = 2; factor <= sqrtN; factor++) if (!(n % factor)) return false;
	return true;
};
const getFractionalBits = n => ((n - (n | 0)) * 0x100000000) | 0;
let n = 2;
let nPrime = 0;
while (nPrime < 64) {
	if (isPrime(n)) {
		if (nPrime < 8) H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
		K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));
		nPrime++;
	}
	n++;
}

// Reusable object
const W = [];

/**
 * SHA-256 hash algorithm.
 */
export class SHA256 extends Hasher {
	constructor(cfg) {
		super(cfg);
	}
	_doReset() {
		this._hash = new WordArray(H.slice(0));
	}

	_doProcessBlock(M, offset) {
		const H = this._hash.words; // Shortcut
		let [a, b, c, d, e, f, g, h] = H; // Working variables

		// Computation
		for (let i = 0; i < 16; i++) {
			W[i] = M[offset + i] | 0;
			const ch = (e & f) ^ (~e & g);
			const maj = (a & b) ^ (a & c) ^ (b & c);
			const sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
			const sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7) | (e >>> 25));
			const t1 = h + sigma1 + ch + K[i] + W[i];
			const t2 = sigma0 + maj;
			h = g;
			g = f;
			f = e;
			e = (d + t1) | 0;
			d = c;
			c = b;
			b = a;
			a = (t1 + t2) | 0;
		}
		for (let i = 16; i < 64; i++) {
			const gamma0x = W[i - 15];
			const gamma0 = ((gamma0x << 25) | (gamma0x >>> 7)) ^ ((gamma0x << 14) | (gamma0x >>> 18)) ^ (gamma0x >>> 3);
			const gamma1x = W[i - 2];
			const gamma1 =
				((gamma1x << 15) | (gamma1x >>> 17)) ^ ((gamma1x << 13) | (gamma1x >>> 19)) ^ (gamma1x >>> 10);
			W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];

			const ch = (e & f) ^ (~e & g);
			const maj = (a & b) ^ (a & c) ^ (b & c);
			const sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
			const sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7) | (e >>> 25));
			const t1 = h + sigma1 + ch + K[i] + W[i];
			const t2 = sigma0 + maj;
			h = g;
			g = f;
			f = e;
			e = (d + t1) | 0;
			d = c;
			c = b;
			b = a;
			a = (t1 + t2) | 0;
		}
		// Intermediate hash value
		H[0] = (H[0] + a) | 0;
		H[1] = (H[1] + b) | 0;
		H[2] = (H[2] + c) | 0;
		H[3] = (H[3] + d) | 0;
		H[4] = (H[4] + e) | 0;
		H[5] = (H[5] + f) | 0;
		H[6] = (H[6] + g) | 0;
		H[7] = (H[7] + h) | 0;
	}

	_doFinalize() {
		const data = this._data; // Shortcuts
		const dataWords = data.words; // Shortcuts
		const nBitsTotal = this._nDataBytes * 8;
		const nBitsLeft = data.sigBytes * 8;
		dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32)); // Add padding
		dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
		dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
		data.sigBytes = dataWords.length * 4;
		this._process(); // Hash final blocks
		return this._hash; // Return final computed hash
	}

	clone() {
		const clonedOne = super.clone();
		clonedOne._hash = this._hash.clone();
		return clonedOne;
	}
}

/**
 * Shortcut function to the hasher's object interface.
 *
 * @param {WordArray|string} message The message to hash.
 *
 * @return {WordArray} The hash.
 *
 * @static
 *
 * @example
 *
 *     const hash = CryptoJS.SHA256('message');
 *     const hash = CryptoJS.SHA256(wordArray);
 */
C.SHA256 = Hasher._createHelper(SHA256);

/**
 * Shortcut function to the HMAC's object interface.
 *
 * @param {WordArray|string} message The message to hash.
 * @param {WordArray|string} key The secret key.
 *
 * @return {WordArray} The HMAC.
 *
 * @static
 *
 * @example
 *
 *     const hmac = CryptoJS.HmacSHA256(message, key);
 */
C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
