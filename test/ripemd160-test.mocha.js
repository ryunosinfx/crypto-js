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

export class UnitTestRIPEMD160 {
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
		describe('algo-ripemd160-test', function () {
			describe('RIPEMD160', function () {
				it('testVector1', () =>
					assert.equal(
						'37f332f68db77bd9d7edd4969571ad671cf9dd3b',
						C.RIPEMD160('The quick brown fox jumps over the lazy dog').toString()
					));
				it('testVector2', () =>
					assert.equal(
						'132072df690933835eb8b6ad0b77e7b6f14acad7',
						C.RIPEMD160('The quick brown fox jumps over the lazy cog').toString()
					));
				it('testVector3', () =>
					assert.equal('9c1185a5c5e9fc54612808977ee8f548b2258d31', C.RIPEMD160('').toString()));
			});
		});
	}
}
