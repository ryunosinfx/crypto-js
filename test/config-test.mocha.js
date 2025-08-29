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

export class UnitTestConfig {
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
		describe('config-test', function () {
			describe('Config', function () {
				beforeEach(() => {
					data.saltA = CryptoJS.enc.Hex.parse('AA00000000000000');
					data.saltB = CryptoJS.enc.Hex.parse('BB00000000000000');
				});

				it('testEncrypt', () => {
					assert.equal(
						C.AES.encrypt('Test', 'Pass', { salt: data.saltA }).toString(),
						C.AES.encrypt('Test', 'Pass', { salt: data.saltA }).toString()
					);
					assert.notEqual(
						C.AES.encrypt('Test', 'Pass', { salt: data.saltA }).toString(),
						C.AES.encrypt('Test', 'Pass', { salt: data.saltB }).toString()
					);
				});

				it('testDecrypt', () => {
					const encryptedA = C.AES.encrypt('Test', 'Pass', { salt: data.saltA });
					const encryptedB = C.AES.encrypt('Test', 'Pass', { salt: data.saltB });
					assert.equal('Test', C.AES.decrypt(encryptedA, 'Pass').toString(C.enc.Utf8));
					assert.equal('Test', C.AES.decrypt(encryptedB, 'Pass').toString(C.enc.Utf8));
				});

				it('testCustomKDFHasher', () => {
					//SHA1
					const encryptedSHA1 = C.AES.encrypt('Test', 'Pass', {
						salt: data.saltA,
						hasher: C.algo.SHA1,
					}).toString();
					assert.equal(
						'Test',
						C.AES.decrypt(encryptedSHA1, 'Pass', { hasher: C.algo.SHA1 }).toString(C.enc.Utf8)
					);

					//SHA256
					const encryptedSHA256 = C.AES.encrypt('Test', 'Pass', {
						salt: data.saltA,
						hasher: C.algo.SHA256,
					}).toString();
					assert.equal(
						'Test',
						C.AES.decrypt(encryptedSHA256, 'Pass', { hasher: C.algo.SHA256 }).toString(C.enc.Utf8)
					);

					//SHA512
					const encryptedSHA512 = C.AES.encrypt('Test', 'Pass', {
						salt: data.saltA,
						hasher: C.algo.SHA512,
					}).toString();
					assert.equal(
						'Test',
						C.AES.decrypt(encryptedSHA512, 'Pass', { hasher: C.algo.SHA512 }).toString(C.enc.Utf8)
					);

					//Default: MD5
					const encryptedDefault = C.AES.encrypt('Test', 'Pass', { salt: data.saltA }).toString();
					const encryptedMD5 = C.AES.encrypt('Test', 'Pass', {
						salt: data.saltA,
						hasher: C.algo.MD5,
					}).toString();
					assert.equal(
						'Test',
						C.AES.decrypt(encryptedMD5, 'Pass', { hasher: C.algo.MD5 }).toString(C.enc.Utf8)
					);
					assert.equal(encryptedDefault, encryptedMD5);

					//Different KDFHasher
					assert.notEqual(encryptedDefault, encryptedSHA1);
					assert.notEqual(encryptedDefault, encryptedSHA256);
					assert.notEqual(encryptedDefault, encryptedSHA512);
				});
			});
		});
	}
}
