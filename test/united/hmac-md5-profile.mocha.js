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

export class UnitTestHmacMD5Profile {
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
		describe('algo-hmac-md5-profile', function () {
			describe('HMAC MD5', function () {
				beforeEach(() => {
					data.key = C.lib.WordArray.random(128 / 8);
				});

				it('profileSinglePartMessage', () => {
					let singlePartMessage = '';
					for (let i = 0; i < 500; i++)
						singlePartMessage += '12345678901234567890123456789012345678901234567890';
					new C.algo.HMAC(C.algo.MD5, data.key).finalize(singlePartMessage) + '';
				});

				it('profileMultiPartMessage', () => {
					const hmac = new C.algo.HMAC(C.algo.MD5, data.key);
					for (let i = 0; i < 500; i++) hmac.update('12345678901234567890123456789012345678901234567890');
					hmac.finalize() + '';
				});
			});
		});
	}
}
