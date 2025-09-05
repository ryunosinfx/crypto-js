import { Base } from './abstract-base.js';
import { WordArray } from './word-array.js';
import { Utf8 } from './enc-utf8.js';
/**
 * Abstract buffered block algorithm template.
 *
 * The property blockSize must be implemented in a concrete subtype.
 *
 * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
 */
export class BufferedBlockAlgorithm extends Base {
	static blockSize = 512 / 32;
	constructor(cfg) {
		super();
		this.blockSize = BufferedBlockAlgorithm.blockSize; // Default block size in words (512 bits)
		this.cfg = Base.mixIn(this.cfg, cfg); // Apply config defaults
		this._data = new WordArray(); // Data buffer
		this._nDataBytes = 0; // Number of bytes in the data buffer
	}
	/**
	 * Resets this block algorithm's data buffer to its initial state.
	 *
	 * @example
	 *
	 *     bufferedBlockAlgorithm.reset();
	 */
	reset() {
		this._data = new WordArray(); // Initial values
		this._nDataBytes = 0;
	}

	/**
	 * Adds new data to this block algorithm's buffer.
	 *
	 * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
	 *
	 * @example
	 *
	 *     bufferedBlockAlgorithm._append('data');
	 *     bufferedBlockAlgorithm._append(wordArray);
	 */
	_append(data) {
		if (typeof data == 'string') data = Utf8.parse(data); // Convert string to WordArray, else assume WordArray already
		this._data.concat(data); // Append
		this._nDataBytes += data.sigBytes;
	}

	/**
	 * Processes available data blocks.
	 *
	 * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
	 *
	 * @param {boolean} isDoFlush Whether all blocks and partial blocks should be processed.
	 *
	 * @return {WordArray} The processed data.
	 *
	 * @example
	 *
	 *     const processedData = bufferedBlockAlgorithm._process();
	 *     const processedData = bufferedBlockAlgorithm._process(!!'flush');
	 */
	_process(isDoFlush) {
		let processedWords;

		// Shortcuts
		const data = this._data;
		const dataWords = data.words;
		const dataSigBytes = data.sigBytes;
		const blockSize = this.blockSize;
		const blockSizeBytes = blockSize * 4;

		// Count blocks ready
		const nBlocksReadyPre = dataSigBytes / blockSizeBytes;
		const nBlocksReady = isDoFlush // Round up to include partial blocks
			? Math.ceil(nBlocksReadyPre)
			: // Round down to include only full blocks,
			  // less the number of blocks that must remain in the buffer
			  Math.max((nBlocksReadyPre | 0) - this._minBufferSize, 0);
		const nWordsReady = nBlocksReady * blockSize; // Count words ready
		const nBytesReady = Math.min(nWordsReady * 4, dataSigBytes); // Count bytes ready
		// Process blocks
		if (nWordsReady) {
			for (let offset = 0; offset < nWordsReady; offset += blockSize) this._doProcessBlock(dataWords, offset); // Perform concrete-algorithm logic
			// Remove processed words
			processedWords = dataWords.splice(0, nWordsReady);
			data.sigBytes -= nBytesReady;
		}
		return new WordArray(processedWords, nBytesReady); // Return processed words
	}
	_doProcessBlock(dataWords, offset) {}
	_doFinalize() {}
	/**
	 * Creates a copy of this object.
	 *
	 * @return {Object} The clone.
	 *
	 * @example
	 *
	 *     const clone = bufferedBlockAlgorithm.clone();
	 */
	clone() {
		const clonedOne = super.clone();
		clonedOne._data = this._data.clone();
		return clonedOne;
	}

	_minBufferSize = 0;
}
