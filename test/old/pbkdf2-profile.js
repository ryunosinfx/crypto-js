YUI.add(
	'algo-pbkdf2-profile',
	Y => {
		var C = CryptoJS;

		Y.Profiler.add({
			name: 'PBKDF2',

			profileKeySize256Iterations20: () =>
				C.algo.PBKDF2.create({ keySize: 256 / 32, iterations: 20 }).compute(
					'password',
					'ATHENA.MIT.EDUraeburn'
				),
		});
	},
	'$Rev$'
);
