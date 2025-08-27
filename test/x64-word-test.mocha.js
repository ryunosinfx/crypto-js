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
let assert = null;
const C = CryptoJS;

export class UnitTestX64Word {
	static init(chaiM, mochaM, describeM, itM, beforeM, afterM, beforeEachM, afterEachM) {
		if (chaiM) {
			chai = chaiM;
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
		describe('x64-word-test', function () {
			describe('X64Word', function () {
				it('testInit', () => {
					const word = new C.x64.Word(0x00010203, 0x04050607);

					assert.equal(0x00010203, word.high, 'word.high');
					assert.equal(0x04050607, word.low, 'word.low');
				});

				// testNot: () =>{
				// const  word = C.x64.Word.create(0x00010203, 0x04050607).not();

				// assert.equal(~0x00010203, word.high, 'word.high');
				// assert.equal(~0x04050607, word.low, 'word.low');
				// },

				// testAnd: () =>{
				// const  word1 = C.x64.Word.create(0x00010203, 0x04050607);
				// const  word2 = C.x64.Word.create(0x18191a1b, 0x1c1d1e1f);
				// const  anded = word1.and(word2);

				// assert.equal(0x00010203 & 0x18191a1b, anded.high, 'word.high');
				// assert.equal(0x04050607 & 0x1c1d1e1f, anded.low, 'word.low');
				// },

				// testOr: () =>{
				// const  word1 = C.x64.Word.create(0x00010203, 0x04050607);
				// const  word2 = C.x64.Word.create(0x18191a1b, 0x1c1d1e1f);
				// const  ored = word1.or(word2);

				// assert.equal(0x00010203 | 0x18191a1b, ored.high, 'word.high');
				// assert.equal(0x04050607 | 0x1c1d1e1f, ored.low, 'word.low');
				// },

				// testXor: () =>{
				// const  word1 = C.x64.Word.create(0x00010203, 0x04050607);
				// const  word2 = C.x64.Word.create(0x18191a1b, 0x1c1d1e1f);
				// const  xored = word1.xor(word2);

				// assert.equal(0x00010203 ^ 0x18191a1b, xored.high, 'word.high');
				// assert.equal(0x04050607 ^ 0x1c1d1e1f, xored.low, 'word.low');
				// },

				// testShiftL25: () =>{
				// const  word = C.x64.Word.create(0x00010203, 0x04050607).shiftL(25);

				// assert.equal(0x06080a0c, word.high, 'word.high');
				// assert.equal(0x0e000000, word.low, 'word.low');
				// },

				// testShiftL32: () =>{
				// const  word = C.x64.Word.create(0x00010203, 0x04050607).shiftL(32);

				// assert.equal(0x04050607, word.high, 'word.high');
				// assert.equal(0x00000000, word.low, 'word.low');
				// },

				// testShiftR7: () =>{
				// const  word = C.x64.Word.create(0x00010203, 0x04050607).shiftR(7);

				// assert.equal(0x00000204, word.high, 'word.high');
				// assert.equal(0x06080A0C, word.low, 'word.low');
				// },

				// testShiftR32: () =>{
				// const  word = C.x64.Word.create(0x00010203, 0x04050607).shiftR(32);

				// assert.equal(0x00000000, word.high, 'word.high');
				// assert.equal(0x00010203, word.low, 'word.low');
				// },

				// testRotL: () =>{
				// const  word = C.x64.Word.create(0x00010203, 0x04050607).rotL(25);

				// assert.equal(0x06080a0c, word.high, 'word.high');
				// assert.equal(0x0e000204, word.low, 'word.low');
				// },

				// testRotR: () =>{
				// const  word = C.x64.Word.create(0x00010203, 0x04050607).rotR(7);

				// assert.equal(0x0e000204, word.high, 'word.high');
				// assert.equal(0x06080a0c, word.low, 'word.low');
				// },

				// testAdd: () =>{
				// const  word1 = C.x64.Word.create(0x00010203, 0x04050607);
				// const  word2 = C.x64.Word.create(0x18191a1b, 0x1c1d1e1f);
				// const  added = word1.add(word2);

				// assert.equal(0x181a1c1e, added.high, 'word.high');
				// assert.equal(0x20222426, added.low, 'word.low');
				// }
			});
		});
	}
}
