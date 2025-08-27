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

export class UnitTestX64WordArray {
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
		describe('x64-wordarray-test', function () {
			describe('X64WordArray', function () {
				it('testInit0', () => assert.equal('', new C.x64.WordArray().toX32().toString()));
				it('testInit1', () => {
					const wordArray = new C.x64.WordArray([
						new C.x64.Word(0x00010203, 0x04050607),
						new C.x64.Word(0x18191a1b, 0x1c1d1e1f),
					]);

					assert.equal('000102030405060718191a1b1c1d1e1f', wordArray.toX32().toString());
				});

				it('testInit2', () => {
					const wordArray = new C.x64.WordArray(
						[new C.x64.Word(0x00010203, 0x04050607), new C.x64.Word(0x18191a1b, 0x1c1d1e1f)],
						10
					);

					assert.equal('00010203040506071819', wordArray.toX32().toString());
				});

				it('testToX32', () => {
					const wordArray = new C.x64.WordArray(
						[new C.x64.Word(0x00010203, 0x04050607), new C.x64.Word(0x18191a1b, 0x1c1d1e1f)],
						10
					);

					assert.equal('00010203040506071819', wordArray.toX32().toString());
				});
			});
		});
	}
}
