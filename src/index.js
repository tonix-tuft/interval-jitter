/*
 * Copyright (c) 2020 Anton Bagdatyev (Tonix-Tuft)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Interval jitter.
 */

/**
 * @type {number}
 */
const INTERVAL_JITTER_DEFAULT_MAX_INTERVAL = 1000;

/**
 * @type {number}
 */
const INTERVAL_JITTER_MAX_INTERVAL = 2147483647;

/**
 * A jitter which does something at random intervals.
 *
 * @constructor
 *
 * @param {Function} callback Callback to execute at random intervals.
 *                            The callback will be bound to the instance of this IntervalJitter.
 * @param {Object} [obj] An object with further parameters.
 * @param {number} [obj.minInterval] Minimum delay in milliseconds between the executions of the given callback.
 *                                   Defaults to 0.
 * @param {number} [obj.maxInterval] Maximum delay in milliseconds between the executions of the given callback.
 *                                   Defaults to 1000 milliseconds (1 second).
 */
function IntervalJitter(
  callback,
  { minInterval = 0, maxInterval = INTERVAL_JITTER_DEFAULT_MAX_INTERVAL } = {}
) {
  /**
   * @property {Function}
   */
  this.callback = callback;

  /**
   * @property {Boolean}
   */
  this.stopped = true;

  /**
   * @property {Number}
   */
  this.minInterval;
  this.setMinInterval(minInterval);

  /**
   * @property {number}
   */
  this.maxInterval;
  this.setMaxInterval(maxInterval);

  /**
   * @property {?number}
   */
  this.outerTimeoutTimer = null;

  /**
   * @property {?number}
   */
  this.innerTimeoutTimer = null;
}

/**
 * Set the minimum delay between the executions of the jitter's callback in milliseconds.
 *
 * @param {number} minInterval Minimum delay in milliseconds.
 * @return {undefined}
 */
IntervalJitter.prototype.setMinInterval = function(minInterval) {
  if (
    (minInterval !== 0 && !minInterval) ||
    minInterval < 0 ||
    minInterval > INTERVAL_JITTER_MAX_INTERVAL ||
    minInterval > this.maxInterval
  ) {
    this.minInterval = 0;
  } else {
    this.minInterval = minInterval;
  }
};

/**
 * Set the maximum delay between the executions of the jitter's callback in milliseconds.
 *
 * @param {number} maxInterval Maximum delay in milliseconds.
 * @return {undefined}
 */
IntervalJitter.prototype.setMaxInterval = function(maxInterval) {
  if (
    (maxInterval !== 0 && !maxInterval) ||
    maxInterval < 0 ||
    maxInterval < this.minInterval
  ) {
    this.maxInterval = INTERVAL_JITTER_DEFAULT_MAX_INTERVAL;
  } else if (maxInterval > INTERVAL_JITTER_MAX_INTERVAL) {
    this.maxInterval = INTERVAL_JITTER_MAX_INTERVAL;
  } else {
    this.maxInterval = maxInterval;
  }
};

/**
 * Sets the callback of the jitter.
 *
 * @param {Function} callback The callback to execute.
 * @return {undefined}
 */
IntervalJitter.prototype.setCallback = function(callback) {
  if (typeof callback === "function") {
    this.callback = callback;
  }
};

/**
 * Runs this jitter.
 * The callback given during construction will be executed at random intervals
 * computed before each iteration using the min/max intervals given during construction,
 * set on the jitter instance or the default min/max intervals.
 *
 * @return {undefined}
 */
IntervalJitter.prototype.run = function() {
  this.stopped = false;
  const loop = () => {
    // Stop if this jitter was stopped.
    if (this.stopped) {
      return;
    }
    const randomInterval =
      Math.floor(Math.random() * (this.maxInterval - this.minInterval + 1)) +
      this.minInterval;
    this.randomInterval = randomInterval;
    this.outerTimeoutTimer = setTimeout(() => {
      const res = this.callback.call(this);
      this.onCallbackExecuted(res);

      // Giving the browser the time to do its things before repeating the process.
      this.innerTimeoutTimer = setTimeout(loop);
    }, randomInterval);
  };
  loop();
};

/**
 * Prototype method invoked each time the jitter's callback is executed.
 * This method MAY be overridden by child classes defined in client code
 * inheriting from this jitter class.
 *
 * @param {*} res The result of the callback.
 * @return {undefined}
 */
// eslint-disable-next-line no-unused-vars
IntervalJitter.prototype.onCallbackExecuted = function(res) {
  return;
};

/**
 * Stops the execution of this jitter.
 * The jitter's callback will not be executed after calling this method,
 * but can be resumed again with {@link IntervalJitter.prototype.run}.
 *
 * @return {undefined}
 */
IntervalJitter.prototype.stop = function() {
  if (this.outerTimeoutTimer) {
    clearTimeout(this.outerTimeoutTimer);
  }
  if (this.innerTimeoutTimer) {
    clearTimeout(this.innerTimeoutTimer);
  }
  this.stopped = true;
};

export default IntervalJitter;
