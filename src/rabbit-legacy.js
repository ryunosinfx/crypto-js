import { CryptoJS, Base } from './core.js';
import { StreamCipher } from './cipher-core.js';
// Shortcuts
const C = CryptoJS;

// Reusable objects
const S = [];
const C_ = [];
const G = [];

/**
 * Rabbit stream cipher algorithm.
 *
 * This is a legacy version that neglected to convert the key to little-endian.
 * This error doesn't affect the cipher's security,
 * but it does affect its compatibility with other implementations.
 */
export class RabbitLegacy extends StreamCipher {
	static blockSize = 128 / 32;
	static ivSize = 64 / 32;
	constructor(isEncryption, key, cfg) {
		// console.log('RabbitLegacy constructor A cfg:', cfg);
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.blockSize = RabbitLegacy.blockSize;
		this.ivSize = RabbitLegacy.ivSize;
		this.cfg = Base.mixIn(this.cfg, { keySize: this.keySize, ivSize: this.ivSize, blockSize: this.blockSize });
		// console.log('RabbitLegacy constructor B this.cfg:', this.cfg);
		this.reset();
	}
	_doReset() {
		const K = this._key.words; // Shortcuts
		const iv = this.cfg.iv; // Shortcuts
		// console.log('_doReset K, iv,X,C', K, iv, this._X, this._C);

		// Generate initial state values
		const X = [
			K[0],
			(K[3] << 16) | (K[2] >>> 16),
			K[1],
			(K[0] << 16) | (K[3] >>> 16),
			K[2],
			(K[1] << 16) | (K[0] >>> 16),
			K[3],
			(K[2] << 16) | (K[1] >>> 16),
		];
		this._X = X;

		// Generate initial counter values
		const C = [
			(K[2] << 16) | (K[2] >>> 16),
			(K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
			(K[3] << 16) | (K[3] >>> 16),
			(K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
			(K[0] << 16) | (K[0] >>> 16),
			(K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
			(K[1] << 16) | (K[1] >>> 16),
			(K[3] & 0xffff0000) | (K[0] & 0x0000ffff),
		];
		this._C = C;
		this._b = 0; // Carry bit
		for (let i = 0; i < 4; i++) this.nextState(); // Iterate the system four times
		for (let i = 0; i < 8; i++) C[i] ^= X[(i + 4) & 7]; // Modify the counters
		// IV setup
		if (iv) {
			const IV = iv.words; // Shortcuts
			const IV_0 = IV[0]; // Shortcuts
			const IV_1 = IV[1]; // Shortcuts

			// Generate four subvectors
			const i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00);
			const i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00);
			const i1 = (i0 >>> 16) | (i2 & 0xffff0000);
			const i3 = (i2 << 16) | (i0 & 0x0000ffff);

			// Modify counter values
			C[0] ^= i0;
			C[1] ^= i1;
			C[2] ^= i2;
			C[3] ^= i3;
			C[4] ^= i0;
			C[5] ^= i1;
			C[6] ^= i2;
			C[7] ^= i3;

			for (let i = 0; i < 4; i++) this.nextState(); // Iterate the system four times
		}
	}

	_doProcessBlock(M, offset) {
		// console.log('_doProcessBlock M, offset,X,C', M, offset, this._X, this._C);
		const X = this._X; // Shortcut
		this.nextState(); // Iterate the system
		S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16); // Generate four keystream words
		S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16); // Generate four keystream words
		S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16); // Generate four keystream words
		S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16); // Generate four keystream words
		for (let i = 0; i < 4; i++) {
			S[i] = (((S[i] << 8) | (S[i] >>> 24)) & 0x00ff00ff) | (((S[i] << 24) | (S[i] >>> 8)) & 0xff00ff00); // Swap endian
			M[offset + i] ^= S[i]; // Encrypt
		}
	}
	nextState() {
		const X = this._X; // Shortcuts
		const C = this._C; // Shortcuts
		for (let i = 0; i < 8; i++) C_[i] = C[i]; // Save old counter values
		// Calculate new counter values
		C[0] = (C[0] + 0x4d34d34d + this._b) | 0;
		C[1] = (C[1] + 0xd34d34d3 + (C[0] >>> 0 < C_[0] >>> 0 ? 1 : 0)) | 0;
		C[2] = (C[2] + 0x34d34d34 + (C[1] >>> 0 < C_[1] >>> 0 ? 1 : 0)) | 0;
		C[3] = (C[3] + 0x4d34d34d + (C[2] >>> 0 < C_[2] >>> 0 ? 1 : 0)) | 0;
		C[4] = (C[4] + 0xd34d34d3 + (C[3] >>> 0 < C_[3] >>> 0 ? 1 : 0)) | 0;
		C[5] = (C[5] + 0x34d34d34 + (C[4] >>> 0 < C_[4] >>> 0 ? 1 : 0)) | 0;
		C[6] = (C[6] + 0x4d34d34d + (C[5] >>> 0 < C_[5] >>> 0 ? 1 : 0)) | 0;
		C[7] = (C[7] + 0xd34d34d3 + (C[6] >>> 0 < C_[6] >>> 0 ? 1 : 0)) | 0;
		this._b = C[7] >>> 0 < C_[7] >>> 0 ? 1 : 0;

		// Calculate the g-values
		for (let i = 0; i < 8; i++) {
			const gx = X[i] + C[i];
			const ga = gx & 0xffff; // Construct high and low argument for squaring
			const gb = gx >>> 16; // Construct high and low argument for squaring
			const gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb; // Calculate high and low result of squaring
			const gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0); // Calculate high and low result of squaring
			G[i] = gh ^ gl; // High XOR low
		}

		// Calculate new state values
		X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0;
		X[1] = (G[1] + ((G[0] << 8) | (G[0] >>> 24)) + G[7]) | 0;
		X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0;
		X[3] = (G[3] + ((G[2] << 8) | (G[2] >>> 24)) + G[1]) | 0;
		X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0;
		X[5] = (G[5] + ((G[4] << 8) | (G[4] >>> 24)) + G[3]) | 0;
		X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0;
		X[7] = (G[7] + ((G[6] << 8) | (G[6] >>> 24)) + G[5]) | 0;
		// console.log('nextState X,C', this._X, this._C);
	}
}

/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     const ciphertext = CryptoJS.RabbitLegacy.encrypt(message, key, cfg);
 *     const plaintext  = CryptoJS.RabbitLegacy.decrypt(ciphertext, key, cfg);
 */
C.RabbitLegacy = StreamCipher._createHelper(RabbitLegacy);
