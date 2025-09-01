import { Base } from './abstract-base.js';
import { WordArray } from './word-array.js';
import { Latin1 } from './enc-latin1.js';
import { Utf8 } from './enc-utf8.js';
import { Hex } from './enc-hex.js';
import { BufferedBlockAlgorithm } from './abstract-buffered-block-algorithm.js';
import { Hasher } from './abstract-hasher.js';
import { Cipher } from './abstract-cipher.js';
import { StreamCipher } from './abstract-stream-cipher.js';
import { BlockCipherMode } from './abstract-block-cipher-mode.js';
import { BlockCipher } from './abstract-block-cipher.js';
import { CipherParams } from './cipher-params.js';
import { Pkcs7 } from './pad-pkcs7.js';
import { OpenSSLFormatter } from './format-openssl.js';
import { SerializableCipher } from './abstract-serializable-cipher.js';
import { OpenSSLKdf } from './openssl-key-derivation-function.js';
import { PasswordBasedCipher } from './abstract-password-base-cipher.js';
import { CBC } from './mode-cbc.js';
SerializableCipher.defaultConf.format = OpenSSLFormatter;
PasswordBasedCipher.defaultConf.kdf = OpenSSLKdf;
BlockCipher.defaultConf.mode = CBC;
BlockCipher.defaultConf.padding = Pkcs7;
/*globals window, global, require*/

/**
 * CryptoJS core components.
 */

/** Local polyfill of Object.create*/
// const create =
// 	Object.create ||
// 	(function () {
// 		function F() {}
// 		return obj => {
// 			F.prototype = obj;
// 			const subtype = new F();
// 			F.prototype = null;
// 			return subtype;
// 		};
// 	})();

/**
 * CryptoJS namespace.
 */
const C = { lib: {}, algo: {}, enc: {}, x64: {}, pad: {}, mode: {} };

export const CryptoJS = C;
/**
 * Library namespace.
 */
const C_lib = C.lib;
C_lib.WordArray = WordArray; // Export WordArray
/////////////////////////////////////////////////////////////////////////////////////////
WordArray.defaultEncodeHex = Hex;
/**
 * Encoder namespace.
 */
const C_enc = { Utf8, Latin1, Hex }; // Create C_enc namespace
C.enc = C_enc; // Export C_enc
C_lib.BufferedBlockAlgorithm = BufferedBlockAlgorithm; // Export BufferedBlockAlgorithm

const base = new Base();
C_lib.Base = base; // Export Base
C_lib.Hasher = Hasher; // Export Hasher
/**
 * Algorithm namespace.
 */
C_lib.Base = Base;
/**
 * Cipher core components.
 */
CryptoJS.lib.Cipher;

/**
 * Mode namespace.
 */
C.mode = { CBC };
/**
 * Padding namespace.
 */
C.pad = { Pkcs7 };

/**
 * Format namespace.
 */
C.format = { OpenSSL: OpenSSLFormatter };
/**
 * Key derivation function namespace.
 */
C.kdf = { OpenSSL: OpenSSLKdf };
C_lib.Cipher = Cipher;
C_lib.StreamCipher = StreamCipher;
C_lib.BlockCipherMode = BlockCipherMode;
C_lib.BlockCipher = BlockCipher;
C_lib.CipherParams = CipherParams;
C_lib.SerializableCipher = new SerializableCipher();
C_lib.PasswordBasedCipher = new PasswordBasedCipher();
Cipher.PasswordBasedCipher = new PasswordBasedCipher();
Cipher.SerializableCipher = new SerializableCipher();
