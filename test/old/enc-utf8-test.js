YUI.add(
	'enc-utf8-test',
	Y => {
		const C = CryptoJS;

		Y.Test.Runner.add(
			new Y.Test.Case({
				name: 'Utf8',

				testStringify1: () =>
					Y.Assert.areEqual('$', C.enc.Utf8.stringify(C.lib.WordArray.create([0x24000000], 1))),
				testStringify2: () =>
					Y.Assert.areEqual('¢', C.enc.Utf8.stringify(C.lib.WordArray.create([0xc2a20000], 2))),
				testStringify3: () =>
					Y.Assert.areEqual('€', C.enc.Utf8.stringify(C.lib.WordArray.create([0xe282ac00], 3))),
				testStringify4: () =>
					Y.Assert.areEqual('𤭢', C.enc.Utf8.stringify(C.lib.WordArray.create([0xf0a4ada2], 4))),
				testParse1: () =>
					Y.Assert.areEqual(
						C.lib.WordArray.create([0x24000000], 1).toString(),
						C.enc.Utf8.parse('$').toString()
					),
				testParse2: () =>
					Y.Assert.areEqual(
						C.lib.WordArray.create([0xc2a20000], 2).toString(),
						C.enc.Utf8.parse('¢').toString()
					),
				testParse3: () =>
					Y.Assert.areEqual(
						C.lib.WordArray.create([0xe282ac00], 3).toString(),
						C.enc.Utf8.parse('€').toString()
					),
				testParse4: () =>
					Y.Assert.areEqual(
						C.lib.WordArray.create([0xf0a4ada2], 4).toString(),
						C.enc.Utf8.parse('𤭢').toString()
					),
			})
		);
	},
	'$Rev$'
);
