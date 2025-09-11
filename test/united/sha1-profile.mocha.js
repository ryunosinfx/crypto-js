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

export class UnitTestSHA1Profile {
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
			it = o.it;
		describe('algo-sha1-profile', function () {
			describe('SHA1', function () {
				it('profileSinglePartMessage', () => {
					let singlePartMessage = '';
					for (let i = 0; i < 500; i++)
						singlePartMessage += '12345678901234567890123456789012345678901234567890';
					new C.algo.SHA1().finalize(singlePartMessage) + '';
				});

				it('profileMultiPartMessage', () => {
					const sha1 = new C.algo.SHA1();
					for (let i = 0; i < 500; i++) sha1.update('12345678901234567890123456789012345678901234567890');
					sha1.finalize() + '';
				});
			});
		});
	}
}
