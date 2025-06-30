(function () {
	// Check if typed arrays are supported
	if (typeof ArrayBuffer !== 'function') return;
	// Shortcuts
	const C = CryptoJS;
	const C_lib = C.lib;
	const WordArray = C_lib.WordArray;

	const superInit = WordArray.init; // Reference original init

	// Augment WordArray.init to handle typed arrays
	WordArray.init = function (typedArray) {
		if (typedArray instanceof ArrayBuffer) typedArray = new Uint8Array(typedArray); // Convert buffers to uint8

		// Convert other array views to uint8
		if (
			typedArray instanceof Int8Array ||
			(typeof Uint8ClampedArray !== 'undefined' && typedArray instanceof Uint8ClampedArray) ||
			typedArray instanceof Int16Array ||
			typedArray instanceof Uint16Array ||
			typedArray instanceof Int32Array ||
			typedArray instanceof Uint32Array ||
			typedArray instanceof Float32Array ||
			typedArray instanceof Float64Array
		)
			typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
		// Handle Uint8Array
		if (typedArray instanceof Uint8Array) {
			const typedArrayByteLength = typedArray.byteLength; // Shortcut
			const words = []; // Extract bytes
			for (let i = 0; i < typedArrayByteLength; i++) words[i >>> 2] |= typedArray[i] << (24 - (i % 4) * 8);
			superInit.call(this, words, typedArrayByteLength); // Initialize this word array
		} else superInit.apply(this, arguments); // Else call normal init
	};
	const subInit = WordArray.init;
	subInit.prototype = WordArray;
})();
