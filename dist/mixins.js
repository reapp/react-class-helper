'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

Object.defineProperty(exports, '__esModule', {
  value: true
});

// ---------------
// Define Mixins function
// ---------------
exports['default'] = Mixins;
// ---------------
// Import modules
// ---------------

var _invariant = require('react/lib/invariant');

var _invariant2 = _interopRequireWildcard(_invariant);

// ---------------
// Define helpers
// ---------------
function getType(object) {
  return Object.prototype.toString.call(object);
};

function isNull(object) {
  return getType(object) === '[object Null]';
};

function isUndefined(object) {
  return getType(object) === '[object Undefined]';
};

function isDefined(object) {
  return !isUndefined(object) && !isNull(object);
};

function isDefinedOnce() {
  for (var _len = arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
    objects[_key] = arguments[_key];
  }

  return objects.filter(function (object) {
    return isDefined(object);
  }).length === 1;
};

function isObject(object) {
  return getType(object) === '[object Object]';
};

function isFunction(object) {
  return getType(object) === '[object Function]';
};

function apply(self, fn) {
  var args = arguments[2] === undefined ? [] : arguments[2];

  return isFunction(fn) && fn.apply.apply(fn, [self].concat(_toConsumableArray(args)));
};

// ---------------
// Define default rules for React class properties
// ---------------
function getDefaultRules() {
  return {
    // Lifecycle methods
    componentWillMount: Mixins.MANY,
    componentDidMount: Mixins.MANY,
    componentWillReceiveProps: Mixins.MANY,
    shouldComponentUpdate: Mixins.ONCE,
    componentWillUpdate: Mixins.MANY,
    componentDidUpdate: Mixins.MANY,
    componentWillUnmount: Mixins.MANY,

    // Compatibility hack
    getDefaultProps: Mixins.MANY_MERGED,
    getInitialState: Mixins.MANY_MERGED
  };
};
function Mixins(factory) {
  var _this = this;

  var mixins = arguments[1] === undefined ? [] : arguments[1];
  var options = arguments[2] === undefined ? {} : arguments[2];

  // Define settings from options
  var defaultRule = options.defaultRule || Mixins.ONCE;
  var rules = Object.assign(getDefaultRules(), options.rules);

  // Loop over mixins in reverse order
  mixins.reverse().forEach(function (mixin, index) {

    // Loop over mixin property
    Object.keys(mixin).forEach(function (propName) {

      // Compatibility hack
      // Replace 'getInitialState' property with '_getInitialState'
      // to avoid warning message in React
      propName = propName === 'getInitialState' ? '_getInitialState' : propName;

      // Set useful variable
      var rule = rules[propName] || defaultRule;
      var prototypeProp = factory.prototype[propName];
      var mixinProp = mixin[propName];

      // Compatibility hack
      // Merge result of 'getDefaultProps' to 'defaultProps' factory property
      if (propName === 'getDefaultProps') {
        factory.defaultProps = Object.assign(factory.defaultProps || {}, apply(_this, mixinProp));
      }

      // Compatibility hack
      // Merge 'propTypes to 'propTypes' factory property
      else if (propName === 'propTypes') {
        factory.propTypes = Object.assign(factory.propTypes || {}, mixinProp);
      }

      // Compatibility hack
      // Merge statics with factory
      else if (propName === 'statics') {
        Object.assign(factory, mixinProp);
      }

      // Ignore non function property, set factory prototype property to rule wrapper
      else if (isFunction(mixinProp)) {
        factory.prototype[propName] = rule(prototypeProp, mixinProp, propName);
      }
    });
  });
}

;

// ---------------
// Define built-in rules
// ---------------

// Can be defined only once
Mixins.ONCE = function (prototypeProp, mixinProp, propName) {

  _invariant2['default'](isDefinedOnce(prototypeProp, mixinProp), 'You are attempting to define `' + propName + '` on your component more than once. ' + 'This conflict may be due to a mixin.');

  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return apply.apply(undefined, [this, prototypeProp || mixinProp].concat(args));
  };
};

// Can be defined multiple times
Mixins.MANY = function (prototypeProp, mixinProp, propName) {
  var shouldMerge = arguments[3] === undefined ? false : arguments[3];

  return function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return (apply.apply(undefined, [this, mixinProp].concat(args)) || true) && apply.apply(undefined, [this, prototypeProp].concat(args));
  };
};

// Can be defined multiple times, and merge results
Mixins.MANY_MERGED = function (prototypeProp, mixinProp, propName) {
  return function () {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    var mixinResult = apply.apply(undefined, [this, mixinProp].concat(args)) || {};
    var prototypeResult = apply.apply(undefined, [this, prototypeProp].concat(args)) || {};

    _invariant2['default'](isObject(prototypeResult) && isObject(mixinResult), '`' + propName + '` must return an object or null.');

    return Object.assign({}, mixinResult, prototypeResult);
  };
};
module.exports = exports['default'];