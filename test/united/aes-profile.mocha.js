import { CryptoJS } from '../../src/united/crypto.js';
const o = {
	describe: 'describe',
	it: 'it',
	before: 'before',
	after: 'after',
	beforeEach: 'beforeEach',
	afterEach: 'afterEach',
	expect: 'expect',
	should: 'should',
	assertEqual: 'assertEqual',
};
let chai = null;
let mocha = null;
let assert = null;
const C = CryptoJS;

export class UnitTestAesProfile {
	static init(chaiM, mochaM, describeM, itM, beforeM, afterM, beforeEachM, afterEachM) {
		if (chaiM) {
			chai = chaiM;
			mocha = mochaM;
			o.it = itM;
			o.describe = describeM;
			o.before = beforeM;
			o.after = afterM;
			o.beforeEach = beforeEachM;
			o.afterEach = afterEachM;
			assert = chai.assert;
			return;
		}
	}
	static run() {
		const describe = o.describe,
			it = o.it,
			beforeEach = o.beforeEach,
			data = {};
		describe('algo-aes-profile', function () {
			describe('AES', function () {
				beforeEach(() => {
					data.key = C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
					data.iv = C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f');
				});

				it('profileSinglePartMessage', () => {
					const singlePartMessage = [];
					for (let i = 0; i < 500; i++)
						singlePartMessage.push('12345678901234567890123456789012345678901234567890');
					C.algo.AES.createEncryptor(data.key, { iv: data.iv }).finalize(singlePartMessage.join('')) + '';
				});

				it('profileMultiPartMessage', () => {
					const aes = C.algo.AES.createEncryptor(data.key, { iv: data.iv });
					for (let i = 0; i < 500; i++)
						aes.process('12345678901234567890123456789012345678901234567890') + '';
					aes.finalize() + '';
				});
			});
		});
	}
}
