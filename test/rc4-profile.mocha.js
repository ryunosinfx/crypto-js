import { CryptoJS } from '../src/crypto.js';
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

export class UnitTestRC4Profile {
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
		describe('algo-rc4-profile', function () {
			describe('RC4', function () {
				beforeEach(() => {
					data.key = C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f');
				});
				it('profileSinglePartMessage', () => {
					let singlePartMessage = '';
					for (let i = 0; i < 500; i++)
						singlePartMessage += '12345678901234567890123456789012345678901234567890';
					C.algo.RC4.createEncryptor(data.key).finalize(singlePartMessage) + '';
				});
				it('profileMultiPartMessage', () => {
					const rc4 = C.algo.RC4.createEncryptor(data.key);
					for (let i = 0; i < 500; i++)
						rc4.process('12345678901234567890123456789012345678901234567890') + '';
					rc4.finalize() + '';
				});
			});
		});
	}
}
