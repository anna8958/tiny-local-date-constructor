import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LocalDate } from '../src/index.js';

test('constructs a calendar date and exposes its fields', () => {
  const d = new LocalDate(2024, 2, 29);
  assert.equal(d.year, 2024);
  assert.equal(d.month, 2);
  assert.equal(d.day, 29);
});

test('rejects non-integer inputs with TypeError', () => {
  assert.throws(() => new LocalDate(2024.5, 1, 1), TypeError);
  assert.throws(() => new LocalDate(2024, 1.5, 1), TypeError);
  assert.throws(() => new LocalDate(2024, 1, 1.5), TypeError);
  assert.throws(() => new LocalDate('2024', 1, 1), TypeError);
  assert.throws(() => new LocalDate(2024, 1, null), TypeError);
});

test('rejects out-of-range months and days with RangeError', () => {
  assert.throws(() => new LocalDate(2024, 0, 1), RangeError);
  assert.throws(() => new LocalDate(2024, 13, 1), RangeError);
  assert.throws(() => new LocalDate(2024, 1, 0), RangeError);
  assert.throws(() => new LocalDate(2024, 1, 32), RangeError);
  assert.throws(() => new LocalDate(2024, 2, 30), RangeError);
});

test('accepts Feb 29 in a leap year and rejects it otherwise', () => {
  assert.doesNotThrow(() => new LocalDate(2024, 2, 29));
  assert.throws(() => new LocalDate(2023, 2, 29), RangeError);
});

test('handles century leap-year rule', () => {
  assert.throws(() => new LocalDate(1900, 2, 29), RangeError);
  assert.doesNotThrow(() => new LocalDate(2000, 2, 29));
});

test('fromISO parses a valid calendar date', () => {
  const d = LocalDate.fromISO('2024-02-29');
  assert.equal(d.year, 2024);
  assert.equal(d.month, 2);
  assert.equal(d.day, 29);
});

test('fromISO rejects time and offset suffixes', () => {
  assert.throws(() => LocalDate.fromISO('2024-02-29T00:00:00Z'), RangeError);
  assert.throws(() => LocalDate.fromISO('2024-02-29T00:00:00+05:00'), RangeError);
  assert.throws(() => LocalDate.fromISO('2024-02-29 00:00:00'), RangeError);
});

test('fromISO rejects malformed strings', () => {
  assert.throws(() => LocalDate.fromISO('2024-2-29'), RangeError);
  assert.throws(() => LocalDate.fromISO('2024-02-30'), RangeError);
  assert.throws(() => LocalDate.fromISO('not a date'), RangeError);
  assert.throws(() => LocalDate.fromISO(20240229), TypeError);
});

test('toISO pads fields and round-trips through fromISO', () => {
  assert.equal(new LocalDate(2024, 1, 5).toISO(), '2024-01-05');
  assert.equal(new LocalDate(999, 12, 31).toISO(), '0999-12-31');
  const d = new LocalDate(2024, 2, 29);
  assert.equal(LocalDate.fromISO(d.toISO()).equals(d), true);
});

test('equals compares fields, not object identity', () => {
  const a = new LocalDate(2024, 2, 29);
  const b = new LocalDate(2024, 2, 29);
  const c = new LocalDate(2024, 3, 1);
  assert.equal(a.equals(b), true);
  assert.equal(a.equals(c), false);
  assert.equal(a.equals(null), false);
  assert.equal(a.equals('2024-02-29'), false);
});

test('dayOfWeek returns 0 for Sunday through 6 for Saturday', () => {
  assert.equal(new LocalDate(2024, 1, 7).dayOfWeek(), 0); // Sunday
  assert.equal(new LocalDate(2024, 1, 8).dayOfWeek(), 1); // Monday
  assert.equal(new LocalDate(2024, 1, 13).dayOfWeek(), 6); // Saturday
});

test('dayOfWeek is stable for known historical dates', () => {
  assert.equal(new LocalDate(2000, 1, 1).dayOfWeek(), 6); // Saturday
  assert.equal(new LocalDate(1970, 1, 1).dayOfWeek(), 4); // Thursday
});

test('instances are frozen so fields cannot be mutated', () => {
  const d = new LocalDate(2024, 2, 29);
  assert.throws(() => {
    d.day = 1;
  }, TypeError);
  assert.equal(d.day, 29);
});
