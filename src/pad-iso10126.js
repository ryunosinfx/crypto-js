import { WordArray } from './core.js';
/**
 * ISO 10126 padding strategy.
 */
export class Iso10126 {
	static pad = (data, blockSize) => {
		const blockSizeBytes = blockSize * 4; // Shortcut
		const nPaddingBytes = blockSizeBytes - (data.sigBytes % blockSizeBytes); // Count padding bytes
		data.concat(WordArray.random(nPaddingBytes - 1)).concat(
			new WordArray([nPaddingBytes << 24], 1) // Pad
		);
	};

	static unpad = data => {
		const nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff; // Get number of padding bytes from last byte
		data.sigBytes -= nPaddingBytes; // Remove padding
	};
}
