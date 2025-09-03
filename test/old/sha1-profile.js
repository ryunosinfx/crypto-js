YUI.add(
	'algo-sha1-profile',
	Y => {
		const C = CryptoJS;

		Y.Profiler.add({
			name: 'SHA1',

			profileSinglePartMessage: () => {
				let singlePartMessage = '';
				for (let i = 0; i < 500; i++) singlePartMessage += '12345678901234567890123456789012345678901234567890';
				C.algo.SHA1.create().finalize(singlePartMessage) + '';
			},

			profileMultiPartMessage: () => {
				const sha1 = C.algo.SHA1.create();
				for (let i = 0; i < 500; i++) sha1.update('12345678901234567890123456789012345678901234567890');
				sha1.finalize() + '';
			},
		});
	},
	'$Rev$'
);
