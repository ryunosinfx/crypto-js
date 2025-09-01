import { Base } from './abstract-base.js';
import { Cipher } from './abstract-cipher.js';
/**
 * Abstract base block cipher template.
 *
 * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
 */
export class BlockCipher extends Cipher {
	static defaultConf = {
		mode: null, //CBC,
		padding: null, // Pkcs7,
	};
	/**
	 * Configuration options.
	 *
	 * @property {Mode} mode The block mode to use. Default: CBC
	 * @property {Padding} padding The padding strategy to use. Default: Pkcs7
	 */
	constructor(isEncryption, key, cfg) {
		super(isEncryption, key, cfg);
		this.cfg = Base.mixIn(this.cfg, cfg);
		this.cfg = Base.mixIn(this.cfg, BlockCipher.defaultConf);
		this.blockSize = 128 / 32;
		this.cfg = Base.mixIn(this.cfg, { keySize: this.keySize, ivSize: this.ivSize, blockSize: this.blockSize });
	}

	reset() {
		super.reset(); // Reset cipher
		const cfg = this.cfg; // Shortcuts
		const iv = cfg.iv; // Shortcuts
		const mode = cfg.mode; // Shortcuts
		const isRestBlockMode = this.isEncryption; // Reset block mode//== this._ENC_XFORM_MODE
		const modeCreator = isRestBlockMode ? mode.createEncryptor : mode.createDecryptor;
		if (!isRestBlockMode) this._minBufferSize = 1; /* if (this._xformMode == this._DEC_XFORM_MODE) */ // Keep at least one block in the buffer for unpadding
		if (this._mode && this._mode.__creator == modeCreator) {
			this._mode = modeCreator.call(mode, this, iv && iv.words); //			this._mode.init(this, iv && iv.words);
		} else {
			this._mode = modeCreator.call(mode, this, iv && iv.words);
			this._mode.__creator = modeCreator;
		}
	}

	_doProcessBlock(words, offset) {
		this._mode.processBlock(words, offset);
	}

	_doFinalize() {
		let finalProcessedBlocks;
		const padding = this.cfg.padding; // Shortcut
		// Finalize
		if (this.isEncryption) {
			padding.pad(this._data, this.blockSize); // Pad data//== this._ENC_XFORM_MODE
			finalProcessedBlocks = this._process(!!'flush'); // Process final blocks
		} /* if (this._xformMode == this._DEC_XFORM_MODE) */ else {
			finalProcessedBlocks = this._process(!!'flush'); // Process final blocks
			padding.unpad(finalProcessedBlocks); // Unpad data
		}
		return finalProcessedBlocks;
	}
	// static _createHelper = Cipher._createHelper;
}
