import { CryptoJS } from './core.js';
import { Base } from './abstract-base.js';
import { WordArray } from './word-array.js';
import { X64Word } from './x64-core.js';
import { Hasher } from './abstract-hasher.js';
// Shortcuts
const C = CryptoJS;

// Constants tables
const RHO_OFFSETS = [];
const PI_INDEXES = [];
const ROUND_CONSTANTS = [];
const T = [];

// Compute Constants
let x = 1, // Compute rho offset constants
	y = 0;
for (let t = 0; t < 24; t++) {
	RHO_OFFSETS[x + 5 * y] = (((t + 1) * (t + 2)) / 2) % 64;
	const newX = y % 5;
	const newY = (2 * x + 3 * y) % 5;
	x = newX;
	y = newY;
}
for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) PI_INDEXES[x + 5 * y] = y + ((2 * x + 3 * y) % 5) * 5; // Compute pi index constants
let LFSR = 0x01; // Compute round constants
for (let i = 0; i < 24; i++) {
	let roundConstantMsw = 0;
	let roundConstantLsw = 0;
	for (let j = 0; j < 7; j++) {
		if (LFSR & 0x01) {
			const bitPosition = (1 << j) - 1;
			if (bitPosition < 32) roundConstantLsw ^= 1 << bitPosition;
			else roundConstantMsw ^= 1 << (bitPosition - 32); /* if (bitPosition >= 32) */
		}
		// Compute next LFSR
		if (LFSR & 0x80) LFSR = (LFSR << 1) ^ 0x71; // Primitive polynomial over GF(2): x^8 + x^6 + x^5 + x^4 + 1
		else LFSR <<= 1;
	}
	ROUND_CONSTANTS[i] = new X64Word(roundConstantMsw, roundConstantLsw);
}
for (let i = 0; i < 25; i++) T[i] = new X64Word(); // Reusable objects for temporary values

/**
 * SHA-3 hash algorithm.
 */
export class SHA3 extends Hasher {
	/**
	 * Configuration options.
	 *
	 * @property {number} outputLength
	 *   The desired number of bits in the output hash.
	 *   Only values permitted are: 224, 256, 384, 512.
	 *   Default: 512
	 */
	constructor(
		cfg = {
			outputLength: 512,
		}
	) {
		super(cfg);
		this.cfg = Base.mixIn(this.cfg, {});
	}

	_doReset() {
		const state = (this._state = []);
		for (let i = 0; i < 25; i++) state[i] = new X64Word();
		this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
	}

	_doProcessBlock(M, offset) {
		const state = this._state; // Shortcuts
		const nBlockSizeLanes = this.blockSize / 2; // Shortcuts
		// Absorb
		for (let i = 0; i < nBlockSizeLanes; i++) {
			let M2i = M[offset + 2 * i]; // Shortcuts
			let M2i1 = M[offset + 2 * i + 1]; // Shortcuts
			M2i = (((M2i << 8) | (M2i >>> 24)) & 0x00ff00ff) | (((M2i << 24) | (M2i >>> 8)) & 0xff00ff00); // Swap endian
			M2i1 = (((M2i1 << 8) | (M2i1 >>> 24)) & 0x00ff00ff) | (((M2i1 << 24) | (M2i1 >>> 8)) & 0xff00ff00); // Swap endian
			const lane = state[i]; // Absorb message into state
			lane.high ^= M2i1;
			lane.low ^= M2i;
		}
		// Rounds
		for (let round = 0; round < 24; round++) {
			// Theta
			for (let x = 0; x < 5; x++) {
				// Mix column lanes
				let tMsw = 0,
					tLsw = 0;
				for (let y = 0; y < 5; y++) {
					const lane = state[x + 5 * y];
					tMsw ^= lane.high;
					tLsw ^= lane.low;
				}
				// Temporary values
				const Tx = T[x];
				Tx.high = tMsw;
				Tx.low = tLsw;
			}
			for (let x = 0; x < 5; x++) {
				const Tx4 = T[(x + 4) % 5]; // Shortcuts
				const Tx1 = T[(x + 1) % 5]; // Shortcuts
				const Tx1Msw = Tx1.high; // Shortcuts
				const Tx1Lsw = Tx1.low; // Shortcuts
				// Mix surrounding columns
				const tMsw = Tx4.high ^ ((Tx1Msw << 1) | (Tx1Lsw >>> 31));
				const tLsw = Tx4.low ^ ((Tx1Lsw << 1) | (Tx1Msw >>> 31));
				for (let y = 0; y < 5; y++) {
					const lane = state[x + 5 * y];
					lane.high ^= tMsw;
					lane.low ^= tLsw;
				}
			}
			// Rho Pi
			for (let laneIndex = 1; laneIndex < 25; laneIndex++) {
				let tMsw;
				let tLsw;
				const lane = state[laneIndex]; // Shortcuts
				let laneMsw = lane.high; // Shortcuts
				let laneLsw = lane.low; // Shortcuts
				const rhoOffset = RHO_OFFSETS[laneIndex]; // Shortcuts
				// Rotate lanes
				if (rhoOffset < 32) {
					tMsw = (laneMsw << rhoOffset) | (laneLsw >>> (32 - rhoOffset));
					tLsw = (laneLsw << rhoOffset) | (laneMsw >>> (32 - rhoOffset));
				} /* if (rhoOffset >= 32) */ else {
					tMsw = (laneLsw << (rhoOffset - 32)) | (laneMsw >>> (64 - rhoOffset));
					tLsw = (laneMsw << (rhoOffset - 32)) | (laneLsw >>> (64 - rhoOffset));
				}
				const TPiLane = T[PI_INDEXES[laneIndex]]; // Transpose lanes
				TPiLane.high = tMsw;
				TPiLane.low = tLsw;
			}
			const T0 = T[0]; // Rho pi at x = y = 0
			const state0 = state[0];
			T0.high = state0.high;
			T0.low = state0.low;

			// Chi
			for (let x = 0; x < 5; x++)
				for (let y = 0; y < 5; y++) {
					const laneIndex = x + 5 * y; // Shortcuts
					const lane = state[laneIndex]; // Shortcuts
					const TLane = T[laneIndex]; // Shortcuts
					const Tx1Lane = T[((x + 1) % 5) + 5 * y]; // Shortcuts
					const Tx2Lane = T[((x + 2) % 5) + 5 * y]; // Shortcuts
					lane.high = TLane.high ^ (~Tx1Lane.high & Tx2Lane.high); // Mix rows
					lane.low = TLane.low ^ (~Tx1Lane.low & Tx2Lane.low); // Mix rows
				}
			const lane = state[0]; // Iota
			const roundConstant = ROUND_CONSTANTS[round];
			lane.high ^= roundConstant.high;
			lane.low ^= roundConstant.low;
		}
	}

	_doFinalize() {
		const data = this._data; // Shortcuts
		const dataWords = data.words; // Shortcuts
		// const nBitsTotal = this._nDataBytes * 8;// Shortcuts
		const nBitsLeft = data.sigBytes * 8; // Shortcuts
		const blockSizeBits = this.blockSize * 32; // Shortcuts
		// Add padding
		dataWords[nBitsLeft >>> 5] |= 0x1 << (24 - (nBitsLeft % 32));
		dataWords[((Math.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits) >>> 5) - 1] |= 0x80;
		data.sigBytes = dataWords.length * 4;
		this._process(); // Hash final blocks
		const state = this._state; // Shortcuts
		const outputLengthBytes = this.cfg.outputLength / 8; // Shortcuts
		const outputLengthLanes = outputLengthBytes / 8; // Shortcuts
		const hashWords = []; // Squeeze
		for (let i = 0; i < outputLengthLanes; i++) {
			const lane = state[i]; // Shortcuts
			let laneMsw = lane.high; // Shortcuts
			let laneLsw = lane.low; // Shortcuts
			// Swap endian
			laneMsw =
				(((laneMsw << 8) | (laneMsw >>> 24)) & 0x00ff00ff) | (((laneMsw << 24) | (laneMsw >>> 8)) & 0xff00ff00);
			laneLsw =
				(((laneLsw << 8) | (laneLsw >>> 24)) & 0x00ff00ff) | (((laneLsw << 24) | (laneLsw >>> 8)) & 0xff00ff00);
			hashWords.push(laneLsw); // Squeeze state to retrieve hash
			hashWords.push(laneMsw); // Squeeze state to retrieve hash
		}
		return new WordArray(hashWords, outputLengthBytes); // Return final computed hash
	}

	clone() {
		const clonedOne = super.clone();
		const state = this._state.slice(0);
		clonedOne._state = state;
		for (let i = 0; i < 25; i++) state[i] = state[i].clone();
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
 *     const hash = CryptoJS.SHA3('message');
 *     const hash = CryptoJS.SHA3(wordArray);
 */
C.SHA3 = Hasher._createHelper(SHA3);

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
 *     const hmac = CryptoJS.HmacSHA3(message, key);
 */
C.HmacSHA3 = Hasher._createHmacHelper(SHA3);
