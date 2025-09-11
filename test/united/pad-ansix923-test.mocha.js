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

export class UnitTestAnsiX923 {
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
		describe('pad-ansix923-test', function () {
			describe('AnsiX923', function () {
				it('testPad', () => {
					const data = new C.lib.WordArray([0xdddddd00], 3);
					C.pad.AnsiX923.pad(data, 2);
					assert.equal(new C.lib.WordArray([0xdddddd00, 0x00000005]).toString(), data.toString());
				});

				it('testPadClamp', () => {
					const data = new C.lib.WordArray([0xdddddddd, 0xdddddddd], 3);
					C.pad.AnsiX923.pad(data, 2);
					assert.equal(new C.lib.WordArray([0xdddddd00, 0x00000005]).toString(), data.toString());
				});

				it('testUnpad', () => {
					const data = new C.lib.WordArray([0xdddddd00, 0x00000005]);
					C.pad.AnsiX923.unpad(data);
					assert.equal(new C.lib.WordArray([0xdddddd00], 3).toString(), data.toString());
				});
			});
		});
	}
}
