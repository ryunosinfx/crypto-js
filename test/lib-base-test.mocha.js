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
const Base = C.lib.Base;

function hasInstanceMethod(cls, methodName) {
	return typeof cls?.prototype?.[methodName] === 'function';
}

export class UnitTestBase {
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
		describe('lib-base-test', function () {
			describe('Base', function () {
				beforeEach(() => {
					class overrides {
						constructor(arg) {
							this.initFired = true;
							this.initArg = arg;
						}

						toString() {}
					}
					data.overrides = overrides;

					data.mixins = {
						mixinMethod: () => {},
					};

					class a extends Base {
						constructor(arg) {
							super();
							this.initFired = true;
							this.initArg = arg;
							this.cfg = Base.mixIn(this.cfg, data.overrides);
						}
						toString() {}
					}
					data.Obj = a;
					Base.mixIn(data.Obj, data.mixins);

					data.obj = new data.Obj('argValue');

					data.objClone = data.obj.clone();
				});

				it('testExtendInheritance', () => {
					// assert.equal(Base.extend, data.Obj.extend);
					assert.isFalse(data.Obj.hasOwnProperty('extend'));
				});

				it('testExtendSuper', () => assert.equal(Base, Object.getPrototypeOf(data.obj.constructor)));
				it('testExtendOverrideInit', () => {
					assert.equal(data.overrides.init, data.Obj.init);
					// assert.isTrue(hasInstanceMethod(data.Obj, 'init'));
				});

				it('testExtendOverrideToString', () => {
					assert.equal(data.overrides.toString, data.Obj.toString);
					assert.isTrue(hasInstanceMethod(data.Obj, 'toString'));
				});

				it('testCreateInheritanceFromBase', () => {
					// assert.equal(Base.extend, data.obj.extend);
					assert.isFalse(hasInstanceMethod(data.obj, 'extend'));
				});

				it('testCreateSuper', () => assert.equal(data.Obj, Object.getPrototypeOf(data.obj).constructor));
				it('testCreateInit', () => {
					assert.isTrue(data.obj.initFired);
					assert.equal('argValue', data.obj.initArg);
				});

				it('testMixIn', () => {
					assert.equal(data.mixins.mixinMethod, data.Obj.mixinMethod);
					assert.isTrue(data.Obj.hasOwnProperty('mixinMethod'));
				});

				it('testCloneDistinct', () => assert.notEqual(data.obj, data.objClone));
				it('testCloneCopy', () => assert.equal(data.obj.initArg, data.objClone.initArg));
				it('testCloneIndependent', () => {
					data.obj.initArg = 'newValue';
					assert.notEqual(data.obj.initArg, data.objClone.initArg);
				});

				it('testCloneLeavesOriginalInitPrototypeUnchanged', () => {
					assert.notEqual(data.obj, data.obj.prototype);
					assert.notEqual(data.objClone, data.objClone.prototype);
					assert.equal(data.obj.constructor, data.objClone.constructor);
				});
			});
		});
	}
}
