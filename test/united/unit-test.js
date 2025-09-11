import { UnitTestPBKDF2 } from './pbkdf2-test.mocha.js';
import { UnitTestPBKDF2Profile } from './pbkdf2-profile.mocha.js';
import { UnitTestAesProfile } from './aes-profile.mocha.js';
import { UnitTestAes } from './aes-test.mocha.js';
import { UnitTestBlowfish } from './blowfish-test.mocha.js';
import { UnitTestCipher } from './cipher-test.mocha.js';
import { UnitTestConfig } from './config-test.mocha.js';
import { UnitTestDESProfile } from './des-profile.mocha.js';
import { UnitTestDES } from './des-test.mocha.js';
import { UnitTestBase64 } from './enc-base64-test.mocha.js';
import { UnitTestHex } from './enc-hex-test.mocha.js';
import { UnitTestLatin1 } from './enc-latin1-test.mocha.js';
import { UnitTestUtf8 } from './enc-utf8-test.mocha.js';
import { UnitTestUtf16 } from './enc-utf16-test.mocha.js';
import { UnitTestEvpKDF } from './evpkdf-test.mocha.js';
import { UnitTestEvpKDFProfile } from './evpkdf-profile.mocha.js';
import { UnitTestOpenSSLFormatter } from './format-openssl-test.mocha.js';
import { UnitTestHmacMD5Profile } from './hmac-md5-profile.mocha.js';
import { UnitTestHmacMD5 } from './hmac-md5-test.mocha.js';
import { UnitTestHmacSHA256 } from './hmac-sha256-test.mocha.js';
import { UnitTestHmacSHA224 } from './hmac-sha224-test.mocha.js';
import { UnitTestHmacSHA384 } from './hmac-sha384-test.mocha.js';
import { UnitTestHmacSHA512 } from './hmac-sha512-test.mocha.js';
import { UnitTestOpenSSLKdf } from './kdf-openssl-test.mocha.js';
import { UnitTestBase } from './lib-base-test.mocha.js';
import { UnitTestCipherParams } from './lib-cipherparams-test.mocha.js';
import { UnitTestPasswordBasedCipher } from './lib-passwordbasedcipher-test.mocha.js';
import { UnitTestSerializableCipher } from './lib-serializablecipher-test.mocha.js';
import { UnitTestTypedArrays } from './lib-typedarrays-test.mocha.js';
import { UnitTestWordArray } from './lib-wordarray-test.mocha.js';
import { UnitTestMD5Profile } from './md5-profile.mocha.js';
import { UnitTestMD5 } from './md5-test.mocha.js';
import { UnitTestCBC } from './mode-cbc-test.mocha.js';
import { UnitTestCFB } from './mode-cfb-test.mocha.js';
import { UnitTestCTR } from './mode-ctr-test.mocha.js';
import { UnitTestECB } from './mode-ecb-test.mocha.js';
import { UnitTestOFB } from './mode-ofb-test.mocha.js';
import { UnitTestAnsiX923 } from './pad-ansix923-test.mocha.js';
import { UnitTestIso10126 } from './pad-iso10126-test.mocha.js';
import { UnitTestIso97971 } from './pad-iso97971-test.mocha.js';
import { UnitTestPkcs7 } from './pad-pkcs7-test.mocha.js';
import { UnitTestZeroPadding } from './pad-zeropadding-test.mocha.js';
import { UnitTestRabbitLegacy } from './rabbit-legacy-test.mocha.js';
import { UnitTestRabbit } from './rabbit-test.mocha.js';
import { UnitTestRC4Profile } from './rc4-profile.mocha.js';
import { UnitTestRC4 } from './rc4-test.mocha.js';
import { UnitTestRIPEMD160 } from './ripemd160-test.mocha.js';
import { UnitTestSHA1 } from './sha1-test.mocha.js';
import { UnitTestSHA1Profile } from './sha1-profile.mocha.js';
import { UnitTestSHA3 } from './sha3-test.mocha.js';
import { UnitTestSHA3Profile } from './sha3-profile.mocha.js';
import { UnitTestSHA224 } from './sha224-test.mocha.js';
import { UnitTestSHA256 } from './sha256-test.mocha.js';
import { UnitTestSHA256Profile } from './sha256-profile.mocha.js';
import { UnitTestSHA384 } from './sha384-test.mocha.js';
import { UnitTestSHA512 } from './sha512-test.mocha.js';
import { UnitTestSHA512Profile } from './sha512-profile.mocha.js';
import { UnitTestTripleDESProfile } from './tripledes-profile.mocha.js';
import { UnitTestTripleDES } from './tripledes-test.mocha.js';
import { UnitTestX64Word } from './x64-word-test.mocha.js';
import { UnitTestX64WordArray } from './x64-wordarray-test.mocha.js';

const o = {};
const list = [
	UnitTestPBKDF2, //OK
	UnitTestPBKDF2Profile, //OK
	UnitTestAesProfile, //OK
	UnitTestAes, //OK
	UnitTestBlowfish, //OK
	UnitTestCipher, //OK
	UnitTestConfig,
	UnitTestDESProfile, //OK
	UnitTestDES, //OK
	UnitTestBase64, //OK
	UnitTestHex, //OK
	UnitTestLatin1, //OK
	UnitTestUtf8, //OK
	UnitTestUtf16, //OK
	UnitTestEvpKDF, //OK
	UnitTestEvpKDFProfile, //OK
	UnitTestOpenSSLFormatter, //OK
	UnitTestHmacMD5, //OK
	UnitTestHmacMD5Profile, //OK
	UnitTestHmacSHA256, //OK
	UnitTestHmacSHA224, //OK
	UnitTestHmacSHA384, //OK
	UnitTestHmacSHA512, //OK
	UnitTestOpenSSLKdf, //OK
	UnitTestBase, //OK
	UnitTestCipherParams, //OK
	UnitTestPasswordBasedCipher, //OK
	UnitTestSerializableCipher, //OK
	UnitTestTypedArrays, //OK
	UnitTestWordArray, //OK
	UnitTestMD5Profile, //OK
	UnitTestMD5, //OK
	UnitTestCBC, //OK
	UnitTestCFB, //OK
	UnitTestCTR, //OK
	UnitTestECB, //OK
	UnitTestOFB, //OK
	UnitTestAnsiX923, //OK
	UnitTestIso10126, //OK
	UnitTestIso97971, //OK
	UnitTestPkcs7, //OK
	UnitTestZeroPadding, //OK
	UnitTestRabbitLegacy, //OK
	UnitTestRabbit, //OK
	UnitTestRC4Profile, //OK
	UnitTestRC4, //OK
	UnitTestRIPEMD160, //OK
	UnitTestSHA1, //OK
	UnitTestSHA1Profile, //OK
	UnitTestSHA3, //OK
	UnitTestSHA3Profile, //OK
	UnitTestSHA224, //OK
	UnitTestSHA256, //OK
	UnitTestSHA256Profile, //OK
	UnitTestSHA384, //OK
	UnitTestSHA512Profile, //OK
	UnitTestSHA512, //OK
	UnitTestTripleDESProfile, //OK
	UnitTestTripleDES,
	UnitTestX64Word, //OK
	UnitTestX64WordArray, //OK
];
export class UnitTest {
	static init(chaiM, mochaM, describeM, itM, beforeM, afterM, beforeEachM, afterEachM) {
		o.mocha = mochaM;
		for (const test of list) test.init(chaiM, mochaM, describeM, itM, beforeM, afterM, beforeEachM, afterEachM);
	}
	static run() {
		for (const test of list) test.run();
		o.mocha.run();
	}
}
