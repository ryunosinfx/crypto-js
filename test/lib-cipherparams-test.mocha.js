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

export class UnitTestCipherParams {
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
		describe('lib-cipherparams-test', function () {
			describe('CipherParams', function () {
				beforeEach(() => {
					data.ciphertext = C.enc.Hex.parse('000102030405060708090a0b0c0d0e0f');
					data.key = C.enc.Hex.parse('101112131415161718191a1b1c1d1e1f');
					data.iv = C.enc.Hex.parse('202122232425262728292a2b2c2d2e2f');
					data.salt = C.enc.Hex.parse('0123456789abcdef');
					data.algorithm = C.algo.AES;
					data.mode = C.mode.CBC;
					data.padding = C.pad.PKCS7;
					data.blockSize = data.algorithm.blockSize;
					data.formatter = C.format.OpenSSL;

					data.cipherParams = new C.lib.CipherParams({
						ciphertext: data.ciphertext,
						key: data.key,
						iv: data.iv,
						salt: data.salt,
						algorithm: data.algorithm,
						mode: data.mode,
						padding: data.padding,
						blockSize: data.blockSize,
						formatter: data.formatter,
					});
				});

				it('testInit', () => {
					assert.equal(data.ciphertext, data.cipherParams.ciphertext);
					assert.equal(data.key, data.cipherParams.key);
					assert.equal(data.iv, data.cipherParams.iv);
					assert.equal(data.salt, data.cipherParams.salt);
					assert.equal(data.algorithm, data.cipherParams.algorithm);
					assert.equal(data.mode, data.cipherParams.mode);
					assert.equal(data.padding, data.cipherParams.padding);
					assert.equal(data.blockSize, data.cipherParams.blockSize);
					assert.equal(data.formatter, data.cipherParams.formatter);
				});

				it('testToString0', () =>
					assert.equal(C.format.OpenSSL.stringify(data.cipherParams), data.cipherParams.toString()));
				it('testToString1', () => {
					const JsonFormatter = {
						stringify: cipherParams =>
							'{ ct: ' + cipherParams.ciphertext + ', iv: ' + cipherParams.iv + ' }',
					};

					assert.equal(JsonFormatter.stringify(data.cipherParams), data.cipherParams.toString(JsonFormatter));
				});
			});
		});
	}
}
