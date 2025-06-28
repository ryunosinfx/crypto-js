YUI.add(
	'enc-latin1-test',
	Y => {
		const C = CryptoJS;

		Y.Test.Runner.add(
			new Y.Test.Case({
				name: 'Latin1',

				testStringify: () =>
					Y.Assert.areEqual('\x12\x34\x56\x78', C.enc.Latin1.stringify(C.lib.WordArray.create([0x12345678]))),
				testParse: () =>
					Y.Assert.areEqual(
						C.lib.WordArray.create([0x12345678]).toString(),
						C.enc.Latin1.parse('\x12\x34\x56\x78').toString()
					),
			})
		);
	},
	'$Rev$'
);
