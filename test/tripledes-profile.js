YUI.add(
	'algo-tripledes-profile',
	Y => {
		const C = CryptoJS;

		Y.Profiler.add({
			name: 'TripleDES',

			setUp: () => {
				this.data = {
					key: C.enc.Hex.parse('0001020304050607'),
					iv: C.enc.Hex.parse('08090a0b0c0d0e0f'),
				};
			},

			profileSinglePartMessage: () => {
				let singlePartMessage = '';
				for (let i = 0; i < 100; i++) singlePartMessage += '12345678901234567890123456789012345678901234567890';
				C.algo.TripleDES.createEncryptor(this.data.key, { iv: this.data.iv }).finalize(singlePartMessage) + '';
			},

			profileMultiPartMessage: () => {
				const des = C.algo.TripleDES.createEncryptor(this.data.key, { iv: this.data.iv });
				for (let i = 0; i < 100; i++) des.process('12345678901234567890123456789012345678901234567890') + '';
				des.finalize() + '';
			},
		});
	},
	'$Rev$'
);
