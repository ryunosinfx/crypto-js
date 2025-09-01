import { Base } from './abstract-base.js';
import { Cipher } from './abstract-cipher.js';
/**
 * Abstract base stream cipher template.
 *
 * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
 */
export class StreamCipher extends Cipher {
	static addConf = { keySize: null, ivSize: null, blockSize: null };
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.blockSize = 1;
		const addConf = StreamCipher.addConf;
		addConf.keySize = this.keySize;
		addConf.ivSize = this.ivSize;
		addConf.blockSize = this.blockSize;
		this.cfg = Base.mixIn(this.cfg, addConf);
	}
	_doFinalize() {
		return this._process(!!'flush'); //finalProcessedBlocks Process partial blocks
	}
}
