import { CryptoJS, Base } from './core.js';
import { BlockCipher } from './cipher-core.js';

// Shortcuts
const C = CryptoJS;

// Lookup tables
const SBOX = [];
const INV_SBOX = [];
const SUB_MIX_0 = [];
const SUB_MIX_1 = [];
const SUB_MIX_2 = [];
const SUB_MIX_3 = [];
const INV_SUB_MIX_0 = [];
const INV_SUB_MIX_1 = [];
const INV_SUB_MIX_2 = [];
const INV_SUB_MIX_3 = [];

// Compute lookup tables
const d = []; // Compute double table
for (let i = 0; i < 256; i++) d[i] = i < 128 ? i << 1 : (i << 1) ^ 0x11b;
let x = 0, // Walk GF(2^8)
	xi = 0;
for (let i = 0; i < 256; i++) {
	const sxi = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4); // Compute sbox
	const sx = (sxi >>> 8) ^ (sxi & 0xff) ^ 0x63;
	SBOX[x] = sx;
	INV_SBOX[sx] = x;
	const x2 = d[x]; // Compute multiplication
	const x4 = d[x2];
	const x8 = d[x4];
	const s = (d[sx] * 0x101) ^ (sx * 0x1010100); // Compute sub bytes, mix columns tables
	SUB_MIX_0[x] = (s << 24) | (s >>> 8);
	SUB_MIX_1[x] = (s << 16) | (s >>> 16);
	SUB_MIX_2[x] = (s << 8) | (s >>> 24);
	SUB_MIX_3[x] = s;
	const t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100); // Compute inv sub bytes, inv mix columns tables
	INV_SUB_MIX_0[sx] = (t << 24) | (t >>> 8);
	INV_SUB_MIX_1[sx] = (t << 16) | (t >>> 16);
	INV_SUB_MIX_2[sx] = (t << 8) | (t >>> 24);
	INV_SUB_MIX_3[sx] = t;
	if (!x) x = xi = 1; // Compute next counter
	else {
		x = x2 ^ d[d[d[x8 ^ x2]]];
		xi ^= d[d[xi]];
	}
}

// Precomputed Rcon lookup
const RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

/**
 * AES block cipher algorithm.
 */
export class AES extends BlockCipher {
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.keySize = 256 / 32;
		this.reset();
	}

	_doReset() {
		// console.log('AES _doReset');
		super._doReset();
		let t;
		if (this._nRounds && this._keyPriorReset === this._key) return; // Skip reset of nRounds has been set before and key did not change
		const key = this._key; // Shortcuts
		this._keyPriorReset = key;
		const keyWords = key.words; // Shortcuts
		const keySize = key.sigBytes / 4; // Shortcuts
		const nRounds = (this._nRounds = keySize + 6); // Compute number of rounds
		const ksRows = (nRounds + 1) * 4; // Compute number of key schedule rows
		const keySchedule = []; // Compute key schedule
		this._keySchedule = keySchedule;
		for (let ksRow = 0; ksRow < ksRows; ksRow++)
			if (ksRow < keySize) keySchedule[ksRow] = keyWords[ksRow];
			else {
				t = keySchedule[ksRow - 1];
				if (!(ksRow % keySize)) {
					t = (t << 8) | (t >>> 24); // Rot word
					t = // Sub word
						(SBOX[t >>> 24] << 24) |
						(SBOX[(t >>> 16) & 0xff] << 16) |
						(SBOX[(t >>> 8) & 0xff] << 8) |
						SBOX[t & 0xff];
					t ^= RCON[(ksRow / keySize) | 0] << 24; // Mix Rcon
				} else if (keySize > 6 && ksRow % keySize == 4) {
					t = // Sub word
						(SBOX[t >>> 24] << 24) |
						(SBOX[(t >>> 16) & 0xff] << 16) |
						(SBOX[(t >>> 8) & 0xff] << 8) |
						SBOX[t & 0xff];
				}
				keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
			}

		const invKeySchedule = []; // Compute inv key schedule
		this._invKeySchedule = invKeySchedule;
		for (let invKsRow = 0; invKsRow < ksRows; invKsRow++) {
			const ksRow = ksRows - invKsRow;
			const t = invKsRow % 4 ? keySchedule[ksRow] : keySchedule[ksRow - 4];
			if (invKsRow < 4 || ksRow <= 4) invKeySchedule[invKsRow] = t;
			else {
				invKeySchedule[invKsRow] =
					INV_SUB_MIX_0[SBOX[t >>> 24]] ^
					INV_SUB_MIX_1[SBOX[(t >>> 16) & 0xff]] ^
					INV_SUB_MIX_2[SBOX[(t >>> 8) & 0xff]] ^
					INV_SUB_MIX_3[SBOX[t & 0xff]];
			}
		}
	}

	encryptBlock(M, offset) {
		this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
	}

	decryptBlock(M, offset) {
		const s = M[offset + 1]; // Swap 2nd and 4th rows
		M[offset + 1] = M[offset + 3];
		M[offset + 3] = s;
		this._doCryptBlock(
			M,
			offset,
			this._invKeySchedule,
			INV_SUB_MIX_0,
			INV_SUB_MIX_1,
			INV_SUB_MIX_2,
			INV_SUB_MIX_3,
			INV_SBOX
		);
		const t = M[offset + 1]; // Inv swap 2nd and 4th rows
		M[offset + 1] = M[offset + 3];
		M[offset + 3] = t;
	}

	_doCryptBlock(M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
		const nRounds = this._nRounds; // Shortcut
		let s0 = M[offset] ^ keySchedule[0], // Get input, add round key
			s1 = M[offset + 1] ^ keySchedule[1],
			s2 = M[offset + 2] ^ keySchedule[2],
			s3 = M[offset + 3] ^ keySchedule[3],
			ksRow = 4; // Key schedule row counter
		// Rounds
		for (let round = 1; round < nRounds; round++) {
			// Shift rows, sub bytes, mix columns, add round key
			const t0 =
				SUB_MIX_0[s0 >>> 24] ^
				SUB_MIX_1[(s1 >>> 16) & 0xff] ^
				SUB_MIX_2[(s2 >>> 8) & 0xff] ^
				SUB_MIX_3[s3 & 0xff] ^
				keySchedule[ksRow++];
			const t1 =
				SUB_MIX_0[s1 >>> 24] ^
				SUB_MIX_1[(s2 >>> 16) & 0xff] ^
				SUB_MIX_2[(s3 >>> 8) & 0xff] ^
				SUB_MIX_3[s0 & 0xff] ^
				keySchedule[ksRow++];
			const t2 =
				SUB_MIX_0[s2 >>> 24] ^
				SUB_MIX_1[(s3 >>> 16) & 0xff] ^
				SUB_MIX_2[(s0 >>> 8) & 0xff] ^
				SUB_MIX_3[s1 & 0xff] ^
				keySchedule[ksRow++];
			const t3 =
				SUB_MIX_0[s3 >>> 24] ^
				SUB_MIX_1[(s0 >>> 16) & 0xff] ^
				SUB_MIX_2[(s1 >>> 8) & 0xff] ^
				SUB_MIX_3[s2 & 0xff] ^
				keySchedule[ksRow++];

			// Update state
			s0 = t0;
			s1 = t1;
			s2 = t2;
			s3 = t3;
		}

		// Shift rows, sub bytes, add round key
		const t0 =
			((SBOX[s0 >>> 24] << 24) |
				(SBOX[(s1 >>> 16) & 0xff] << 16) |
				(SBOX[(s2 >>> 8) & 0xff] << 8) |
				SBOX[s3 & 0xff]) ^
			keySchedule[ksRow++];
		const t1 =
			((SBOX[s1 >>> 24] << 24) |
				(SBOX[(s2 >>> 16) & 0xff] << 16) |
				(SBOX[(s3 >>> 8) & 0xff] << 8) |
				SBOX[s0 & 0xff]) ^
			keySchedule[ksRow++];
		const t2 =
			((SBOX[s2 >>> 24] << 24) |
				(SBOX[(s3 >>> 16) & 0xff] << 16) |
				(SBOX[(s0 >>> 8) & 0xff] << 8) |
				SBOX[s1 & 0xff]) ^
			keySchedule[ksRow++];
		const t3 =
			((SBOX[s3 >>> 24] << 24) |
				(SBOX[(s0 >>> 16) & 0xff] << 16) |
				(SBOX[(s1 >>> 8) & 0xff] << 8) |
				SBOX[s2 & 0xff]) ^
			keySchedule[ksRow++];

		// Set output
		M[offset] = t0;
		M[offset + 1] = t1;
		M[offset + 2] = t2;
		M[offset + 3] = t3;
	}
}
/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     const ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
 *     const plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
 */
C.AES = BlockCipher._createHelper(AES);
