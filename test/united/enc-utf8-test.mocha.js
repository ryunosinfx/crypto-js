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

export class UnitTestUtf8 {
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
		describe('enc-utf8-test', function () {
			describe('Utf8', function () {
				it('testStringify1', () =>
					assert.equal('$', C.enc.Utf8.stringify(new C.lib.WordArray([0x24000000], 1))));
				it('testStringify2', () =>
					assert.equal('¢', C.enc.Utf8.stringify(new C.lib.WordArray([0xc2a20000], 2))));
				it('testStringify3', () =>
					assert.equal('€', C.enc.Utf8.stringify(new C.lib.WordArray([0xe282ac00], 3))));
				it('testStringify4', () =>
					assert.equal('𤭢', C.enc.Utf8.stringify(new C.lib.WordArray([0xf0a4ada2], 4))));
				it('testParse1', () =>
					assert.equal(new C.lib.WordArray([0x24000000], 1).toString(), C.enc.Utf8.parse('$').toString()));
				it('testParse2', () =>
					assert.equal(new C.lib.WordArray([0xc2a20000], 2).toString(), C.enc.Utf8.parse('¢').toString()));
				it('testParse3', () =>
					assert.equal(new C.lib.WordArray([0xe282ac00], 3).toString(), C.enc.Utf8.parse('€').toString()));
				it('testParse4', () =>
					assert.equal(new C.lib.WordArray([0xf0a4ada2], 4).toString(), C.enc.Utf8.parse('𤭢').toString()));
			});
		});
	}
}
