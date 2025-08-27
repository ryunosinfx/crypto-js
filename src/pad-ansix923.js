/**
 * ANSI X.923 padding strategy.
 */
export class AnsiX923 {
	static pad = (data, blockSize) => {
		const dataSigBytes = data.sigBytes; // Shortcuts
		const blockSizeBytes = blockSize * 4; // Shortcuts
		const nPaddingBytes = blockSizeBytes - (dataSigBytes % blockSizeBytes); // Count padding bytes
		const lastBytePos = dataSigBytes + nPaddingBytes - 1; // Compute last byte position
		data.clamp(); // Pad
		data.words[lastBytePos >>> 2] |= nPaddingBytes << (24 - (lastBytePos % 4) * 8);
		data.sigBytes += nPaddingBytes;
	};

	static unpad = data => {
		const nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff; // Get number of padding bytes from last byte
		data.sigBytes -= nPaddingBytes; // Remove padding
	};
}
