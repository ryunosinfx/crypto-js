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

export class UnitTestBlowfish {
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
		describe('algo-Blowfish-test', function () {
			describe('Blowfish', function () {
				beforeEach(() => {
					data.saltA = CryptoJS.enc.Hex.parse('AA00000000000000');
				});

				it('testEncrypt', () => {
					// console.log('-----A-testEncrypt-----------------------------------');
					const encryptedA = C.Blowfish.encrypt('Test', 'pass', {
						salt: data.saltA,
						hasher: CryptoJS.algo.SHA256,
					}).toString();
					// console.log('-----B-testEncrypt-----------------------------------', encryptedA);
					assert.equal('U2FsdGVkX1+qAAAAAAAAAKTIU8MPrBdH', encryptedA);
				});

				it('testDecrypt', () => {
					const encryptedA = C.Blowfish.encrypt('Test', 'pass', {
						salt: data.saltA,
						hasher: CryptoJS.algo.SHA256,
					}).toString();
					assert.equal(
						'Test',
						C.Blowfish.decrypt(encryptedA, 'pass', { hasher: CryptoJS.algo.SHA256 }).toString(C.enc.Utf8)
					);
				});
			});
		});
	}
}
