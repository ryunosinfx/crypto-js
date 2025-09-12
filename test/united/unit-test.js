import { TestConfig } from './test-config.js';
const list = [];
const o = {};
export class UnitTest {
	static async init(chaiM, mochaM, describeM, itM, beforeM, afterM, beforeEachM, afterEachM) {
		o.mocha = mochaM;
		list.push((await TestConfig.im('pbkdf2-test.mocha.js')).UnitTestPBKDF2);
		list.push((await TestConfig.im('pbkdf2-profile.mocha.js')).UnitTestPBKDF2Profile);
		list.push((await TestConfig.im('aes-profile.mocha.js')).UnitTestAesProfile);
		list.push((await TestConfig.im('aes-test.mocha.js')).UnitTestAes);
		list.push((await TestConfig.im('blowfish-test.mocha.js')).UnitTestBlowfish);
		list.push((await TestConfig.im('cipher-test.mocha.js')).UnitTestCipher);
		list.push((await TestConfig.im('config-test.mocha.js')).UnitTestConfig);
		list.push((await TestConfig.im('des-profile.mocha.js')).UnitTestDESProfile);
		list.push((await TestConfig.im('des-test.mocha.js')).UnitTestDES);
		list.push((await TestConfig.im('enc-base64-test.mocha.js')).UnitTestBase64);
		list.push((await TestConfig.im('enc-hex-test.mocha.js')).UnitTestHex);
		list.push((await TestConfig.im('enc-latin1-test.mocha.js')).UnitTestLatin1);
		list.push((await TestConfig.im('enc-utf8-test.mocha.js')).UnitTestUtf8);
		list.push((await TestConfig.im('enc-utf16-test.mocha.js')).UnitTestUtf16);
		list.push((await TestConfig.im('evpkdf-test.mocha.js')).UnitTestEvpKDF);
		list.push((await TestConfig.im('evpkdf-profile.mocha.js')).UnitTestEvpKDFProfile);
		list.push((await TestConfig.im('format-openssl-test.mocha.js')).UnitTestOpenSSLFormatter);
		list.push((await TestConfig.im('hmac-md5-profile.mocha.js')).UnitTestHmacMD5Profile);
		list.push((await TestConfig.im('hmac-md5-test.mocha.js')).UnitTestHmacMD5);
		list.push((await TestConfig.im('hmac-sha256-test.mocha.js')).UnitTestHmacSHA256);
		list.push((await TestConfig.im('hmac-sha224-test.mocha.js')).UnitTestHmacSHA224);
		list.push((await TestConfig.im('hmac-sha384-test.mocha.js')).UnitTestHmacSHA384);
		list.push((await TestConfig.im('hmac-sha512-test.mocha.js')).UnitTestHmacSHA512);
		list.push((await TestConfig.im('kdf-openssl-test.mocha.js')).UnitTestOpenSSLKdf);
		list.push((await TestConfig.im('lib-base-test.mocha.js')).UnitTestBase);
		list.push((await TestConfig.im('lib-cipherparams-test.mocha.js')).UnitTestCipherParams);
		list.push((await TestConfig.im('lib-passwordbasedcipher-test.mocha.js')).UnitTestPasswordBasedCipher);
		list.push((await TestConfig.im('lib-serializablecipher-test.mocha.js')).UnitTestSerializableCipher);
		list.push((await TestConfig.im('lib-typedarrays-test.mocha.js')).UnitTestTypedArrays);
		list.push((await TestConfig.im('lib-wordarray-test.mocha.js')).UnitTestWordArray);
		list.push((await TestConfig.im('md5-profile.mocha.js')).UnitTestMD5Profile);
		list.push((await TestConfig.im('md5-test.mocha.js')).UnitTestMD5);
		list.push((await TestConfig.im('mode-cbc-test.mocha.js')).UnitTestCBC);
		list.push((await TestConfig.im('mode-cfb-test.mocha.js')).UnitTestCFB);
		list.push((await TestConfig.im('mode-ctr-test.mocha.js')).UnitTestCTR);
		list.push((await TestConfig.im('mode-ecb-test.mocha.js')).UnitTestECB);
		list.push((await TestConfig.im('mode-ofb-test.mocha.js')).UnitTestOFB);
		list.push((await TestConfig.im('pad-ansix923-test.mocha.js')).UnitTestAnsiX923);
		list.push((await TestConfig.im('pad-iso10126-test.mocha.js')).UnitTestIso10126);
		list.push((await TestConfig.im('pad-iso97971-test.mocha.js')).UnitTestIso97971);
		list.push((await TestConfig.im('pad-pkcs7-test.mocha.js')).UnitTestPkcs7);
		list.push((await TestConfig.im('pad-zeropadding-test.mocha.js')).UnitTestZeroPadding);
		list.push((await TestConfig.im('rabbit-legacy-test.mocha.js')).UnitTestRabbitLegacy);
		list.push((await TestConfig.im('rabbit-test.mocha.js')).UnitTestRabbit);
		list.push((await TestConfig.im('rc4-profile.mocha.js')).UnitTestRC4Profile);
		list.push((await TestConfig.im('rc4-test.mocha.js')).UnitTestRC4);
		list.push((await TestConfig.im('ripemd160-test.mocha.js')).UnitTestRIPEMD160);
		list.push((await TestConfig.im('sha1-test.mocha.js')).UnitTestSHA1);
		list.push((await TestConfig.im('sha1-profile.mocha.js')).UnitTestSHA1Profile);
		list.push((await TestConfig.im('sha3-test.mocha.js')).UnitTestSHA3);
		list.push((await TestConfig.im('sha3-profile.mocha.js')).UnitTestSHA3Profile);
		list.push((await TestConfig.im('sha224-test.mocha.js')).UnitTestSHA224);
		list.push((await TestConfig.im('sha256-test.mocha.js')).UnitTestSHA256);
		list.push((await TestConfig.im('sha256-profile.mocha.js')).UnitTestSHA256Profile);
		list.push((await TestConfig.im('sha384-test.mocha.js')).UnitTestSHA384);
		list.push((await TestConfig.im('sha512-test.mocha.js')).UnitTestSHA512);
		list.push((await TestConfig.im('sha512-profile.mocha.js')).UnitTestSHA512Profile);
		list.push((await TestConfig.im('tripledes-profile.mocha.js')).UnitTestTripleDESProfile);
		list.push((await TestConfig.im('tripledes-test.mocha.js')).UnitTestTripleDES);
		list.push((await TestConfig.im('x64-word-test.mocha.js')).UnitTestX64Word);
		list.push((await TestConfig.im('x64-wordarray-test.mocha.js')).UnitTestX64WordArray);
		for (const test of list)
			await test.init(chaiM, mochaM, describeM, itM, beforeM, afterM, beforeEachM, afterEachM);
	}
	static run() {
		for (const test of list) test.run();
		o.mocha.run();
	}
}
