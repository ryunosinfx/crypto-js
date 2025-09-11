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

export class UnitTestLatin1 {
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
		describe('enc-latin1-test', function () {
			describe('Latin1', function () {
				it('testStringify', () =>
					assert.equal('\x12\x34\x56\x78', C.enc.Latin1.stringify(new C.lib.WordArray([0x12345678]))));
				it('testParse', () =>
					assert.equal(
						new C.lib.WordArray([0x12345678]).toString(),
						C.enc.Latin1.parse('\x12\x34\x56\x78').toString()
					));
			});
		});
	}
}
