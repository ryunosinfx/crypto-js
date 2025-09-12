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

export class UnitTestIso10126 {
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
			it = o.it,
			beforeEach = o.beforeEach,
			data = {};
		describe('pad-iso10126-test', function () {
			describe('Iso10126', function () {
				beforeEach(() => {
					// Save original random method
					data.random = C.lib.WordArray.random;

					// Replace random method with one that returns a predictable value
					C.lib.WordArray.random = nBytes => {
						const words = [];
						for (let i = 0; i < nBytes; i += 4) words.push([0x11223344]);
						return new C.lib.WordArray(words, nBytes);
					};
				});

				it('tearDown', () => {
					// Restore random method
					C.lib.WordArray.random = data.random;
				});

				it('testPad', () => {
					const data = new C.lib.WordArray([0xdddddd00], 3);
					C.pad.Iso10126.pad(data, 2);
					assert.equal(new C.lib.WordArray([0xdddddd11, 0x22334405]).toString(), data.toString());
				});

				it('testPadClamp', () => {
					const data = new C.lib.WordArray([0xdddddddd, 0xdddddddd], 3);
					C.pad.Iso10126.pad(data, 2);
					assert.equal(new C.lib.WordArray([0xdddddd11, 0x22334405]).toString(), data.toString());
				});

				it('testUnpad', () => {
					const data = new C.lib.WordArray([0xdddddd11, 0x22334405]);
					C.pad.Iso10126.unpad(data);
					assert.equal(new C.lib.WordArray([0xdddddd00], 3).toString(), data.toString());
				});
			});
		});
	}
}
