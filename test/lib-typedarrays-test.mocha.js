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

export class UnitTestTypedArrays {
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

		describe('lib-wordarray-test', function () {
			describe('TypedArrays', function () {
				beforeEach(() => {
					data.buffer = new ArrayBuffer(8);

					const uint8View = new Uint8Array(data.buffer);
					uint8View[0] = 0x01;
					uint8View[1] = 0x23;
					uint8View[2] = 0x45;
					uint8View[3] = 0x67;
					uint8View[4] = 0x89;
					uint8View[5] = 0xab;
					uint8View[6] = 0xcd;
					uint8View[7] = 0xef;
				});

				it('testInt8Array', () =>
					assert.equal('0123456789abcdef', new C.lib.WordArray(new Int8Array(data.buffer)).toString()));
				it('testUint8Array', () =>
					assert.equal('0123456789abcdef', new C.lib.WordArray(new Uint8Array(data.buffer)).toString()));
				it('testUint8ClampedArray', () =>
					assert.equal(
						'0123456789abcdef',
						new C.lib.WordArray(new Uint8ClampedArray(data.buffer)).toString()
					));
				it('testInt16Array', () =>
					assert.equal('0123456789abcdef', new C.lib.WordArray(new Int16Array(data.buffer)).toString()));
				it('testUint16Array', () =>
					assert.equal('0123456789abcdef', new C.lib.WordArray(new Uint16Array(data.buffer)).toString()));
				it('testInt32Array', () =>
					assert.equal('0123456789abcdef', new C.lib.WordArray(new Int32Array(data.buffer)).toString()));
				it('testUint32Array', () =>
					assert.equal('0123456789abcdef', new C.lib.WordArray(new Uint32Array(data.buffer)).toString()));
				it('testPartialView', () =>
					assert.equal('456789ab', new C.lib.WordArray(new Int16Array(data.buffer, 2, 2)).toString()));
			});
		});
	}
}
