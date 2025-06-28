YUI.add(
	'algo-md5-profile',
	Y => {
		const C = CryptoJS;

		Y.Profiler.add({
			name: 'MD5',

			profileSinglePartMessage: () => {
				const singlePartMessage = '';
				for (let i = 0; i < 500; i++) singlePartMessage += '12345678901234567890123456789012345678901234567890';
				C.algo.MD5.create().finalize(singlePartMessage) + '';
			},

			profileMultiPartMessage: () => {
				const md5 = C.algo.MD5.create();
				for (let i = 0; i < 500; i++) md5.update('12345678901234567890123456789012345678901234567890');
				md5.finalize() + '';
			},
		});
	},
	'$Rev$'
);
