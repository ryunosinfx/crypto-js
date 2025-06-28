const data = {};
YUI.add(
	'lib-wordarray-test',
	Y => {
		const C = CryptoJS;

		if (typeof ArrayBuffer != 'undefined') {
			Y.Test.Runner.add(
				new Y.Test.Case({
					name: 'TypedArrays',

					setUp: () => {
						data.buffer = new ArrayBuffer(8);

						const uint8View = new Uint8Array(data.buffer);
						uint8View[0] = 0x01;
						uint8View[1] = 0x23;
						uint8View[2] = 0x45;
						uint8View[3] = 0x67;
						uint8View[4] = 0x89;
						uint8View[5] = 0xab;
						uint8View[6] = 0xcd;
						uint8View[7] = 0xef;
					},

					testInt8Array: () =>
						Y.Assert.areEqual(
							'0123456789abcdef',
							C.lib.WordArray.create(new Int8Array(data.buffer)).toString()
						),
					testUint8Array: () =>
						Y.Assert.areEqual(
							'0123456789abcdef',
							C.lib.WordArray.create(new Uint8Array(data.buffer)).toString()
						),
					testUint8ClampedArray: () =>
						Y.Assert.areEqual(
							'0123456789abcdef',
							C.lib.WordArray.create(new Uint8ClampedArray(data.buffer)).toString()
						),
					testInt16Array: () =>
						Y.Assert.areEqual(
							'0123456789abcdef',
							C.lib.WordArray.create(new Int16Array(data.buffer)).toString()
						),
					testUint16Array: () =>
						Y.Assert.areEqual(
							'0123456789abcdef',
							C.lib.WordArray.create(new Uint16Array(data.buffer)).toString()
						),
					testInt32Array: () =>
						Y.Assert.areEqual(
							'0123456789abcdef',
							C.lib.WordArray.create(new Int32Array(data.buffer)).toString()
						),
					testUint32Array: () =>
						Y.Assert.areEqual(
							'0123456789abcdef',
							C.lib.WordArray.create(new Uint32Array(data.buffer)).toString()
						),
					testPartialView: () =>
						Y.Assert.areEqual(
							'456789ab',
							C.lib.WordArray.create(new Int16Array(data.buffer, 2, 2)).toString()
						),
				})
			);
		}
	},
	'$Rev$'
);
