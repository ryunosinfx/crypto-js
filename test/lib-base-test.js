const data = {};
YUI.add(
	'lib-base-test',
	Y => {
		var C = CryptoJS;

		Y.Test.Runner.add(
			new Y.Test.Case({
				name: 'Base',

				setUp: () => {
					data.overrides = {
						init: function (arg) {
							this.initFired = true;
							this.initArg = arg;
						},

						toString: () => {},
					};

					data.mixins = {
						mixinMethod: () => {},
					};

					data.Obj = C.lib.Base.extend(data.overrides);

					data.Obj.mixIn(data.mixins);

					data.obj = data.Obj.create('argValue');

					data.objClone = data.obj.clone();
				},

				testExtendInheritance: () => {
					Y.Assert.areEqual(C.lib.Base.extend, data.Obj.extend);
					Y.Assert.isFalse(data.Obj.hasOwnProperty('extend'));
				},

				testExtendSuper: () => Y.Assert.areEqual(C.lib.Base, data.Obj.$super),
				testExtendOverrideInit: () => {
					Y.Assert.areEqual(data.overrides.init, data.Obj.init);
					Y.Assert.isTrue(data.Obj.hasOwnProperty('init'));
				},

				testExtendOverrideToString: () => {
					Y.Assert.areEqual(data.overrides.toString, data.Obj.toString);
					Y.Assert.isTrue(data.Obj.hasOwnProperty('toString'));
				},

				testCreateInheritanceFromBase: () => {
					Y.Assert.areEqual(C.lib.Base.extend, data.obj.extend);
					Y.Assert.isFalse(data.obj.hasOwnProperty('extend'));
				},

				testCreateSuper: () => Y.Assert.areEqual(data.Obj, data.obj.$super),
				testCreateInit: () => {
					Y.Assert.isTrue(data.obj.initFired);
					Y.Assert.areEqual('argValue', data.obj.initArg);
				},

				testMixIn: () => {
					Y.Assert.areEqual(data.mixins.mixinMethod, data.Obj.mixinMethod);
					Y.Assert.isTrue(data.Obj.hasOwnProperty('mixinMethod'));
				},

				testCloneDistinct: () => Y.Assert.areNotEqual(data.obj, data.objClone),
				testCloneCopy: () => Y.Assert.areEqual(data.obj.initArg, data.objClone.initArg),
				testCloneIndependent: () => {
					data.obj.initArg = 'newValue';
					Y.Assert.areNotEqual(data.obj.initArg, data.objClone.initArg);
				},

				testCloneLeavesOriginalInitPrototypeUnchanged: () => {
					Y.Assert.areEqual(data.obj, data.obj.init.prototype);
					Y.Assert.areEqual(data.objClone, data.objClone.init.prototype);
					Y.Assert.areNotEqual(data.obj.init.prototype, data.objClone.init.prototype);
				},
			})
		);
	},
	'$Rev$'
);
