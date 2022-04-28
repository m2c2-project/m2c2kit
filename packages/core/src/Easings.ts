export type EasingFunction = (
  t: number,
  b: number,
  c: number,
  d: number
) => number;

export class Easings {
  // These easing functions are adapted from work by Robert Penner

  // Terms of Use: Easing Functions (Equations)
  // Open source under the MIT License and the 3-Clause BSD License.
  // MIT License
  // Copyright © 2001 Robert Penner
  // Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  // The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  //
  // BSD License
  // Copyright © 2001 Robert Penner
  // Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
  // Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
  // Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
  // Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.
  // THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

  static linear: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    return (c * t) / d + b;
  };
  static quadraticIn: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d;
    return c * t * t + b;
  };
  static quadraticOut: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d;
    return -c * t * (t - 2) + b;
  };
  static quadraticInOut: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };
  static cubicIn: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d;
    return c * t * t * t + b;
  };
  static cubicOut: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
  };
  static cubicInOut: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t + 2) + b;
  };
  static quarticIn: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d;
    return c * t * t * t * t + b;
  };
  static quarticOut: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d;
    t--;
    return -c * (t * t * t * t - 1) + b;
  };
  static quarticInOut: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t * t + b;
    t -= 2;
    return (-c / 2) * (t * t * t * t - 2) + b;
  };
  static quinticIn: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d;
    return c * t * t * t * t * t + b;
  };
  static quinticOut: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d;
    t--;
    return c * (t * t * t * t * t + 1) + b;
  };
  static quinticInOut: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t * t * t + 2) + b;
  };
  static sinusoidalIn: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
  };
  static sinusoidalOut: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    return c * Math.sin((t / d) * (Math.PI / 2)) + b;
  };
  static sinusoidalInOut: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
  };
  static exponentialIn: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    return c * Math.pow(2, 10 * (t / d - 1)) + b;
  };
  static exponentialOut: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    return c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
  };
  static exponentialInOut: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
    t--;
    return (c / 2) * (-Math.pow(2, -10 * t) + 2) + b;
  };
  static circularIn: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d;
    return -c * (Math.sqrt(1 - t * t) - 1) + b;
  };
  static circularOut: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d;
    t--;
    return c * Math.sqrt(1 - t * t) + b;
  };
  static circularInOut: EasingFunction = (
    t: number,
    b: number,
    c: number,
    d: number
  ) => {
    t /= d / 2;
    if (t < 1) return (-c / 2) * (Math.sqrt(1 - t * t) - 1) + b;
    t -= 2;
    return (c / 2) * (Math.sqrt(1 - t * t) + 1) + b;
  };
}
