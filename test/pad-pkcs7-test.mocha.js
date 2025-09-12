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

export class UnitTestPkcs7 {
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
		describe('pad-pkcs7-test', function () {
			describe('Pkcs7', function () {
				it('testPad', () => {
					const data = new C.lib.WordArray([0xdddddd00], 3);
					C.pad.Pkcs7.pad(data, 2);
					assert.equal(new C.lib.WordArray([0xdddddd05, 0x05050505]).toString(), data.toString());
				});

				it('testPadClamp', () => {
					const data = new C.lib.WordArray([0xdddddddd, 0xdddddddd], 3);
					C.pad.Pkcs7.pad(data, 2);
					assert.equal(new C.lib.WordArray([0xdddddd05, 0x05050505]).toString(), data.toString());
				});

				it('testUnpad', () => {
					const data = new C.lib.WordArray([0xdddddd05, 0x05050505]);
					C.pad.Pkcs7.unpad(data);
					assert.equal(new C.lib.WordArray([0xdddddd00], 3).toString(), data.toString());
				});
			});
		});
	}
}
