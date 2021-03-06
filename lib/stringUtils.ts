import * as assert from 'assert';

interface GetValue<T> {
  (): T
}

interface Iterator<T> {
  next: GetValue<T>;
}

type StringIterator = Iterator<string>;
type ShouldContinueFn = GetValue<boolean>;

function _repeatForever<T>(value: T): GetValue<T> {
  return function next(): T {
    return value;
  };
}

function _repeatN<T>(n: number, value: T, finalValue: T): GetValue<T> {
  if (n === void 0 || n == -1) {
    return _repeatForever(value);
  }
  assert(n >= 0 && Math.floor(n) == n, "n must be an integer >= 0");
  return function next() {
    if (n == 0) {
      return finalValue;
    } else {
      --n;
      return value;
    }
  };
}

function _splitFromLeft(text: string, separator: string, shouldContinueFn: ShouldContinueFn): StringIterator {
  var i = 0;
  var iterator = { next: next };
  function next(): string {
    var j = shouldContinueFn() ? text.indexOf(separator, i) : -1;
    if (j == -1) {
      iterator.next = done;
      return text.substring(i);
    }
    var piece = text.substring(i, j);
    i = j + separator.length;
    return piece;
  }
  function done(): string {
    iterator.next = null;
    return null;
  }
  return iterator;
}

function _splitFromRight(text: string, separator: string, shouldContinueFn: ShouldContinueFn): StringIterator {
  var i = text.length;
  var iterator = { next: next };
  var sepEnd: number, i2: number;
  function next(): string {
    var shouldContinue = shouldContinueFn();
    i2 = i;
    do {
      var j = (i2 == 0 || !shouldContinue) ? -1 : text.lastIndexOf(separator, i2 - 1);
      if (j == -1) {
        iterator.next = done;
        return text.substring(0, i);
      }
      sepEnd = j + separator.length;
      i2 = j;
    } while (sepEnd > i);
    var piece = text.substring(sepEnd, i);
    i = j;
    return piece;
  }
  function done(): string {
    iterator.next = null;
    return null;
  }
  return iterator;
}

// split at most maxTimes.
export function splitN(text: string, separator: string, maxTimes: number, fromRight?: boolean): string[] {
  assert(maxTimes === void 0 || (maxTimes >= -1 && Math.floor(maxTimes) == maxTimes), "maxTimes must be an integer >= -1");
  assert(separator != "" && typeof separator == "string", "separator cannot be an empty string");
  var shouldContinueFn = _repeatN(maxTimes, true, false);
  var iter = (fromRight ? _splitFromRight : _splitFromLeft)(text, separator, shouldContinueFn);
  var pieces: string[] = [], piece: string;
  while (null != (piece = iter.next())) {
    fromRight ? pieces.unshift(piece) : pieces.push(piece);
  }
  return pieces;
}

export function quoteString(value: string, dQuoteReplacement: string): string {
  var quoteTypes = (value.indexOf("'") != -1 ? 1 : 0) + (value.indexOf('"') != -1 ? 2 : 0);
  // If there are double quotes in the string but no single quotes,
  // then simply wrap with single quotes and return. No escaping needed.
  if (quoteTypes === 2) {
    return "'" + value + "'";
  }
  // Wrap with double quotes for all other cases.
  // Therefore, we need to escape double quotes if they're present.
  if (quoteTypes === 3) {
    value = value.replace(/"/g, dQuoteReplacement || '\\"');
  }
  return '"' + value + '"';
}
