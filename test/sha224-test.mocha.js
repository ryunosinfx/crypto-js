import { TestConfig } from './test-config.js';
const module = await import(TestConfig.CryptoJSPath);
const CryptoJS = module.CryptoJS;
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

export class UnitTestSHA224 {
	static C = C;
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
		describe('algo-sha224-test', function () {
			describe('SHA224', function () {
				it('testVector1', () =>
					assert.equal('d14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f', C.SHA224('').toString()));
				it('tx64-wordarray-testestVector2', () =>
					assert.equal(
						'730e109bd7a8a32b1cb9d9a09aa2325d2430587ddbc0c38bad911525',
						C.SHA224('The quick brown fox jumps over the lazy dog').toString()
					));
				it('testVector3', () =>
					assert.equal(
						'619cba8e8e05826e9b8c519c0a5c68f4fb653e8a3d8aa04bb2c8cd4c',
						C.SHA224('The quick brown fox jumps over the lazy dog.').toString()
					));
			});
		});
	}
}
