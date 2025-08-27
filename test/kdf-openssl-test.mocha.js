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

export class UnitTestOpenSSLKdf {
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
		describe('kdf-openssl-test', function () {
			describe('OpenSSLKdf', function () {
				it('testVector', () => {
					const derivedParams = C.kdf.OpenSSL.execute(
						'password',
						256 / 32,
						128 / 32,
						C.enc.Hex.parse('0a9d8620cf7219f1')
					);

					assert.equal(
						'50f32e0ec9408e02ff42364a52aac95c3694fc027256c6f488bf84b8e60effcd',
						derivedParams.key.toString()
					);
					assert.equal('81381e39b94fd692dff7e2239a298cb6', derivedParams.iv.toString());
					assert.equal('0a9d8620cf7219f1', derivedParams.salt.toString());
				});
			});
		});
	}
}
