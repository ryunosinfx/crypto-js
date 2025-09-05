import { WordArray } from './word-array.js';
import { ZeroPadding } from './pad-zeropadding.js';
/**
 * ISO/IEC 9797-1 Padding Method 2.
 */
export class Iso97971 {
	static initArray = [0x80000000];
	static pad = (data, blockSize) => {
		data.concat(new WordArray(Iso97971.initArray, 1)); // Add 0x80 byte
		ZeroPadding.pad(data, blockSize); // Zero pad the rest
	};

	static unpad = data => {
		ZeroPadding.unpad(data); // Remove zero padding
		data.sigBytes--; // Remove one more byte -- the 0x80 byte
	};
}
