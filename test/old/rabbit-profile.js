YUI.add(
	'algo-rabbit-profile',
	Y => {
		const C = CryptoJS;
		const data = {};

		Y.Profiler.add({
			name: 'Rabbit',

			setUp: () => {
				data.key = C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f');
			},
			profileSinglePartMessage: () => {
				let singlePartMessage = '';
				for (let i = 0; i < 500; i++) singlePartMessage += '12345678901234567890123456789012345678901234567890';
				C.algo.Rabbit.createEncryptor(data.key).finalize(singlePartMessage) + '';
			},
			profileMultiPartMessage: () => {
				const rabbit = C.algo.Rabbit.createEncryptor(data.key);
				for (let i = 0; i < 500; i++) rabbit.process('12345678901234567890123456789012345678901234567890') + '';
				rabbit.finalize() + '';
			},
		});
	},
	'$Rev$'
);
