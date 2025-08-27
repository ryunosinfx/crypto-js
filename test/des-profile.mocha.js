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

export class UnitTestDESProfile {
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
		describe('algo-des-profile', function () {
			describe('DES', function () {
				beforeEach(() => {
					data.key = C.enc.Hex.parse('0001020304050607');
					data.iv = C.enc.Hex.parse('08090a0b0c0d0e0f');
				});

				it('profileSinglePartMessage', () => {
					let singlePartMessage = '';
					for (let i = 0; i < 100; i++)
						singlePartMessage += '12345678901234567890123456789012345678901234567890';
					C.algo.DES.createEncryptor(data.key, { iv: data.iv }).finalize(singlePartMessage) + '';
				});

				it('profileMultiPartMessage', () => {
					const des = C.algo.DES.createEncryptor(data.key, { iv: data.iv });
					for (let i = 0; i < 100; i++)
						des.process('12345678901234567890123456789012345678901234567890') + '';
					des.finalize() + '';
				});
			});
		});
	}
}
