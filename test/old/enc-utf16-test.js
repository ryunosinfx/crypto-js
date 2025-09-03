YUI.add(
	'enc-utf16-test',
	Y => {
		const C = CryptoJS;

		Y.Test.Runner.add(
			new Y.Test.Case({
				name: 'Utf16',

				testStringify1: () =>
					Y.Assert.areEqual('z', C.enc.Utf16.stringify(C.lib.WordArray.create([0x007a0000], 2))),
				testStringify2: () =>
					Y.Assert.areEqual('水', C.enc.Utf16.stringify(C.lib.WordArray.create([0x6c340000], 2))),
				testStringify3: () =>
					Y.Assert.areEqual('𐀀', C.enc.Utf16.stringify(C.lib.WordArray.create([0xd800dc00], 4))),
				testStringify4: () =>
					Y.Assert.areEqual('𝄞', C.enc.Utf16.stringify(C.lib.WordArray.create([0xd834dd1e], 4))),
				testStringify5: () =>
					Y.Assert.areEqual('􏿽', C.enc.Utf16.stringify(C.lib.WordArray.create([0xdbffdffd], 4))),
				testStringifyLE: () =>
					Y.Assert.areEqual('􏿽', C.enc.Utf16LE.stringify(C.lib.WordArray.create([0xffdbfddf], 4))),
				testParse1: () =>
					Y.Assert.areEqual(
						C.lib.WordArray.create([0x007a0000], 2).toString(),
						C.enc.Utf16.parse('z').toString()
					),
				testParse2: () =>
					Y.Assert.areEqual(
						C.lib.WordArray.create([0x6c340000], 2).toString(),
						C.enc.Utf16.parse('水').toString()
					),
				testParse3: () =>
					Y.Assert.areEqual(
						C.lib.WordArray.create([0xd800dc00], 4).toString(),
						C.enc.Utf16.parse('𐀀').toString()
					),
				testParse4: () =>
					Y.Assert.areEqual(
						C.lib.WordArray.create([0xd834dd1e], 4).toString(),
						C.enc.Utf16.parse('𝄞').toString()
					),
				testParse5: () =>
					Y.Assert.areEqual(
						C.lib.WordArray.create([0xdbffdffd], 4).toString(),
						C.enc.Utf16.parse('􏿽').toString()
					),
				testParseLE: () =>
					Y.Assert.areEqual(
						C.lib.WordArray.create([0xffdbfddf], 4).toString(),
						C.enc.Utf16LE.parse('􏿽').toString()
					),
			})
		);
	},
	'$Rev$'
);
