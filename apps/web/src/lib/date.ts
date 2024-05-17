import isodate from "@segment/isodate";

/** @see https://github.com/segmentio/isodate-traverse/blob/master/lib/index.js */

export function convertISOStringToDate(data: unknown) {
  const array = JSON.parse(JSON.stringify(data));
  traverse(array);
  return array;
}

/**
 * Recursively traverse an object or array, and convert
 * all ISO date strings parse into Date objects.
 *
 * @param {Object | Array | string} input - object, array, or string to convert
 * @param {boolean} strict - only convert strings with year, month, and date
 * @return {Object | Array | Date | string}
 */
export function traverse(input: unknown, strict: boolean = true): unknown {
  if (input && typeof input === "object") {
    return traverseObject(input as Record<string, unknown>, strict);
  } else if (Array.isArray(input)) {
    return traverseArray(input, strict);
  } else if (isodate.is(input as string, strict)) {
    return isodate.parse(input as string);
  }
  return input;
}

/**
 * Object traverser helper function.
 *
 * @param {Object} obj - object to traverse
 * @param {boolean} strict - only convert strings with year, month, and date
 * @return {Object}
 */
function traverseObject(obj: Record<string, unknown>, strict: boolean): Record<string, unknown> {
  Object.keys(obj).forEach(function (key) {
    obj[key] = traverse(obj[key], strict);
  });
  return obj;
}

/**
 * Array traverser helper function
 *
 * @param {Array} arr - array to traverse
 * @param {boolean} strict - only convert strings with year, month, and date
 * @return {Array}
 */
function traverseArray(arr: unknown[], strict: boolean): unknown[] {
  arr.forEach(function (value, index) {
    arr[index] = traverse(value, strict);
  });
  return arr;
}
