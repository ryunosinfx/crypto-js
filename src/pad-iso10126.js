/**
 * ISO 10126 padding strategy.
 */
class Iso10126 {
	static pad = (data, blockSize) => {
		const blockSizeBytes = blockSize * 4; // Shortcut
		const nPaddingBytes = blockSizeBytes - (data.sigBytes % blockSizeBytes); // Count padding bytes
		data.concat(CryptoJS.lib.WordArray.random(nPaddingBytes - 1)).concat(
			CryptoJS.lib.WordArray.create([nPaddingBytes << 24], 1) // Pad
		);
	};

	static unpad = data => {
		const nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff; // Get number of padding bytes from last byte
		data.sigBytes -= nPaddingBytes; // Remove padding
	};
}
CryptoJS.pad.Iso10126 = Iso10126;
