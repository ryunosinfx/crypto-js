YUI.add(
	'enc-hex-test',
	Y => {
		const C = CryptoJS;

		Y.Test.Runner.add(
			new Y.Test.Case({
				name: 'Hex',

				testStringify: () =>
					Y.Assert.areEqual('12345678', C.enc.Hex.stringify(C.lib.WordArray.create([0x12345678]))),
				testParse: () =>
					Y.Assert.areEqual(
						C.lib.WordArray.create([0x12345678]).toString(),
						C.enc.Hex.parse('12345678').toString()
					),
			})
		);
	},
	'$Rev$'
);
