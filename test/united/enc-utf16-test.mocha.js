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

export class UnitTestUtf16 {
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
		describe('enc-utf16-test', function () {
			describe('Utf16', function () {
				it('testStringify1', () =>
					assert.equal('z', C.enc.Utf16.stringify(new C.lib.WordArray([0x007a0000], 2))));
				it('testStringify2', () =>
					assert.equal('水', C.enc.Utf16.stringify(new C.lib.WordArray([0x6c340000], 2))));
				it('testStringify3', () =>
					assert.equal('𐀀', C.enc.Utf16.stringify(new C.lib.WordArray([0xd800dc00], 4))));
				it('testStringify4', () =>
					assert.equal('𝄞', C.enc.Utf16.stringify(new C.lib.WordArray([0xd834dd1e], 4))));
				it('testStringify5', () =>
					assert.equal('􏿽', C.enc.Utf16.stringify(new C.lib.WordArray([0xdbffdffd], 4))));
				it('testStringifyLE', () =>
					assert.equal('􏿽', C.enc.Utf16LE.stringify(new C.lib.WordArray([0xffdbfddf], 4))));
				it('testParse1', () =>
					assert.equal(new C.lib.WordArray([0x007a0000], 2).toString(), C.enc.Utf16.parse('z').toString()));
				it('testParse2', () =>
					assert.equal(new C.lib.WordArray([0x6c340000], 2).toString(), C.enc.Utf16.parse('水').toString()));
				it('testParse3', () =>
					assert.equal(new C.lib.WordArray([0xd800dc00], 4).toString(), C.enc.Utf16.parse('𐀀').toString()));
				it('testParse4', () =>
					assert.equal(new C.lib.WordArray([0xd834dd1e], 4).toString(), C.enc.Utf16.parse('𝄞').toString()));
				it('testParse5', () =>
					assert.equal(new C.lib.WordArray([0xdbffdffd], 4).toString(), C.enc.Utf16.parse('􏿽').toString()));
				it('testParseLE', () =>
					assert.equal(new C.lib.WordArray([0xffdbfddf], 4).toString(), C.enc.Utf16LE.parse('􏿽').toString()));
			});
		});
	}
}
