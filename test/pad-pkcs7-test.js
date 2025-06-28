YUI.add(
	'pad-pkcs7-test',
	Y => {
		const C = CryptoJS;

		Y.Test.Runner.add(
			new Y.Test.Case({
				name: 'Pkcs7',

				testPad: () => {
					const data = C.lib.WordArray.create([0xdddddd00], 3);
					C.pad.Pkcs7.pad(data, 2);
					Y.Assert.areEqual(C.lib.WordArray.create([0xdddddd05, 0x05050505]).toString(), data.toString());
				},

				testPadClamp: () => {
					const data = C.lib.WordArray.create([0xdddddddd, 0xdddddddd], 3);
					C.pad.Pkcs7.pad(data, 2);
					Y.Assert.areEqual(C.lib.WordArray.create([0xdddddd05, 0x05050505]).toString(), data.toString());
				},

				testUnpad: () => {
					const data = C.lib.WordArray.create([0xdddddd05, 0x05050505]);
					C.pad.Pkcs7.unpad(data);
					Y.Assert.areEqual(C.lib.WordArray.create([0xdddddd00], 3).toString(), data.toString());
				},
			})
		);
	},
	'$Rev$'
);
