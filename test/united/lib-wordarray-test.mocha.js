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

export class UnitTestWordArray {
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
		describe('lib-wordarray-test', function () {
			describe('WordArray', function () {
				it('testInit0', () => assert.equal('', new C.lib.WordArray().toString()));
				it('testInit1', () => assert.equal('12345678', new C.lib.WordArray([0x12345678]).toString()));
				it('testInit2', () => assert.equal('1234', new C.lib.WordArray([0x12345678], 2).toString()));
				it('testToStringPassedEncoder', () =>
					assert.equal('\x12\x34\x56\x78', new C.lib.WordArray([0x12345678]).toString(C.enc.Latin1)));
				it('testToStringDefaultEncoder', () =>
					assert.equal('12345678', new C.lib.WordArray([0x12345678]).toString()));
				it('testConcat3', () => {
					const wordArray1 = new C.lib.WordArray([0x12345678], 3);
					const wordArray2 = new C.lib.WordArray([0x12345678], 3);

					assert.equal('123456123456', wordArray1.concat(wordArray2).toString());
					assert.equal('123456123456', wordArray1.toString());
				});

				it('testConcat4', () => {
					const wordArray1 = new C.lib.WordArray([0x12345678], 4);
					const wordArray2 = new C.lib.WordArray([0x12345678], 3);

					assert.equal('12345678123456', wordArray1.concat(wordArray2).toString());
					assert.equal('12345678123456', wordArray1.toString());
				});

				it('testConcat5', () => {
					const wordArray1 = new C.lib.WordArray([0x12345678], 5);
					const wordArray2 = new C.lib.WordArray([0x12345678], 3);

					assert.equal('1234567800123456', wordArray1.concat(wordArray2).toString());
					assert.equal('1234567800123456', wordArray1.toString());
				});

				it('testConcatLong', () => {
					const wordArray1 = new C.lib.WordArray();
					const wordArray2 = new C.lib.WordArray();
					const wordArray3 = new C.lib.WordArray();
					for (let i = 0; i < 500000; i++) {
						wordArray2.words[i] = i;
						wordArray3.words[i] = i;
					}
					wordArray2.sigBytes = wordArray3.sigBytes = 500000;

					assert.equal(
						wordArray2.toString() + wordArray3.toString(),
						wordArray1.concat(wordArray2.concat(wordArray3)).toString()
					);
				});

				it('testClamp', () => {
					const wordArray = new C.lib.WordArray([0x12345678, 0x12345678], 3);
					wordArray.clamp();

					assert.equal([0x12345600].toString(), wordArray.words.toString());
				});

				it('testClone', () => {
					const wordArray = new C.lib.WordArray([0x12345678]);
					const clone = wordArray.clone();
					clone.words[0] = 0;

					assert.notEqual(wordArray.toString(), clone.toString());
				});

				it('testRandom', () => {
					assert.notEqual(C.lib.WordArray.random(8).toString(), C.lib.WordArray.random(8).toString());
					assert.equal(8, C.lib.WordArray.random(8).sigBytes);
				});
			});
		});
	}
}
