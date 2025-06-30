/**
 * ISO/IEC 9797-1 Padding Method 2.
 */
class Iso97971 {
	static pad = (data, blockSize) => {
		data.concat(CryptoJS.lib.WordArray.create([0x80000000], 1)); // Add 0x80 byte
		CryptoJS.pad.ZeroPadding.pad(data, blockSize); // Zero pad the rest
	};

	static unpad = data => {
		CryptoJS.pad.ZeroPadding.unpad(data); // Remove zero padding
		data.sigBytes--; // Remove one more byte -- the 0x80 byte
	};
}
CryptoJS.pad.Iso97971 = Iso97971;
