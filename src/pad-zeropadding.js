/**
 * Zero padding strategy.
 */
export class ZeroPadding {
	static pad = (data, blockSize) => {
		const blockSizeBytes = blockSize * 4; // Shortcut
		data.clamp(); // Pad
		data.sigBytes += blockSizeBytes - (data.sigBytes % blockSizeBytes || blockSizeBytes);
	};

	static unpad = data => {
		const dataWords = data.words; // Shortcut
		// Unpad
		for (let i = data.sigBytes - 1; i >= 0; i--)
			if ((dataWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff) {
				data.sigBytes = i + 1;
				break;
			}
	};
}
