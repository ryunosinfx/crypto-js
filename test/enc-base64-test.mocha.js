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

export class UnitTestBase64 {
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
		describe('enc-base64-test', function () {
			describe('Base64', function () {
				it('testStringify0', () =>
					assert.equal('', C.enc.Base64.stringify(new C.lib.WordArray([0x666f6f62, 0x61720000], 0))));
				it('testStringify1', () =>
					assert.equal('Zg==', C.enc.Base64.stringify(new C.lib.WordArray([0x666f6f62, 0x61720000], 1))));
				it('testStringify2', () =>
					assert.equal('Zm8=', C.enc.Base64.stringify(new C.lib.WordArray([0x666f6f62, 0x61720000], 2))));
				it('testStringify3', () =>
					assert.equal('Zm9v', C.enc.Base64.stringify(new C.lib.WordArray([0x666f6f62, 0x61720000], 3))));
				it('testStringify4', () =>
					assert.equal('Zm9vYg==', C.enc.Base64.stringify(new C.lib.WordArray([0x666f6f62, 0x61720000], 4))));
				it('testStringify5', () =>
					assert.equal('Zm9vYmE=', C.enc.Base64.stringify(new C.lib.WordArray([0x666f6f62, 0x61720000], 5))));
				it('testStringify6', () =>
					assert.equal('Zm9vYmFy', C.enc.Base64.stringify(new C.lib.WordArray([0x666f6f62, 0x61720000], 6))));
				it('testStringify15', () =>
					assert.equal(
						'Pj4+Pz8/Pj4+Pz8/PS8r',
						C.enc.Base64.stringify(
							new C.lib.WordArray([0x3e3e3e3f, 0x3f3f3e3e, 0x3e3f3f3f, 0x3d2f2b00], 15)
						)
					));
				it('testParse0', () =>
					assert.equal(
						new C.lib.WordArray([0x666f6f62, 0x61720000], 0).toString(),
						C.enc.Base64.parse('').toString()
					));
				it('testParse1', () =>
					assert.equal(
						new C.lib.WordArray([0x666f6f62, 0x61720000], 1).toString(),
						C.enc.Base64.parse('Zg==').toString()
					));
				it('testParse2', () =>
					assert.equal(
						new C.lib.WordArray([0x666f6f62, 0x61720000], 2).toString(),
						C.enc.Base64.parse('Zm8=').toString()
					));
				it('testParse3', () =>
					assert.equal(
						new C.lib.WordArray([0x666f6f62, 0x61720000], 3).toString(),
						C.enc.Base64.parse('Zm9v').toString()
					));
				it('testParse4', () =>
					assert.equal(
						new C.lib.WordArray([0x666f6f62, 0x61720000], 4).toString(),
						C.enc.Base64.parse('Zm9vYg==').toString()
					));
				it('testParse5', () =>
					assert.equal(
						new C.lib.WordArray([0x666f6f62, 0x61720000], 5).toString(),
						C.enc.Base64.parse('Zm9vYmE=').toString()
					));
				it('testParse6', () =>
					assert.equal(
						new C.lib.WordArray([0x666f6f62, 0x61720000], 6).toString(),
						C.enc.Base64.parse('Zm9vYmFy').toString()
					));
				it('testParse15', () =>
					assert.equal(
						new C.lib.WordArray([0x3e3e3e3f, 0x3f3f3e3e, 0x3e3f3f3f, 0x3d2f2b00], 15).toString(),
						C.enc.Base64.parse('Pj4+Pz8/Pj4+Pz8/PS8r').toString()
					));
			});
		});
	}
}
