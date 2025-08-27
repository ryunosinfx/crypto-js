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

export class UnitTestIso97971 {
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
		describe('pad-iso97971-test', function () {
			describe('Iso97971', function () {
				it('testPad1', () => {
					const data = new C.lib.WordArray([0xdddddd00], 3);
					C.pad.Iso97971.pad(data, 1);
					assert.equal(new C.lib.WordArray([0xdddddd80]).toString(), data.toString());
				});

				it('testPad2', () => {
					const data = new C.lib.WordArray([0xdddddd00], 3);
					C.pad.Iso97971.pad(data, 2);
					assert.equal(new C.lib.WordArray([0xdddddd80, 0x00000000]).toString(), data.toString());
				});

				it('testPadClamp', () => {
					const data = new C.lib.WordArray([0xdddddddd, 0xdddddddd], 3);
					C.pad.Iso97971.pad(data, 2);
					assert.equal(new C.lib.WordArray([0xdddddd80, 0x00000000]).toString(), data.toString());
				});

				it('testUnpad', () => {
					const data = new C.lib.WordArray([0xdddddd80, 0x00000000]);
					C.pad.Iso97971.unpad(data);
					assert.equal(new C.lib.WordArray([0xdddddd00], 3).toString(), data.toString());
				});
			});
		});
	}
}
