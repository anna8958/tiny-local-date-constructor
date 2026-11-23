# tiny-local-date-constructor

Constructs a calendar-only year-month-day triple that never coerces to or from a UTC timestamp, avoiding midnight-shift bugs.

```js
import { LocalDate } from './src/index.js';

const d = new LocalDate(2024, 2, 29);
d.year;   // 2024
d.month;  // 2
d.day;    // 29
d.toISO(); // '2024-02-29'

LocalDate.fromISO('2024-02-29').equals(d); // true
try { LocalDate.fromISO('2024-02-29T00:00:00Z'); } catch (e) { e; } // RangeError
try { new LocalDate(2023, 2, 29); } catch (e) { e; }                // RangeError
```

## Why this exists

The usual way to represent a date in JavaScript is a `Date`, which is an instant on a UTC timeline. When you build one from local calendar parts, the runtime applies the host timezone offset; when you read it back, it applies the offset again. In a zone behind UTC, `new Date(2024, 0, 1)` is 2024-01-01T00:00 local but its UTC date is 2024-01-01T05:00Z, and in a zone ahead of UTC it can land on the previous UTC day. Round-tripping a calendar date through a timestamp therefore shifts it by a day depending on where the code runs.

This library stores only the three calendar fields. There is no epoch value, no timezone, and no `Date` object anywhere in the implementation, so constructing, comparing, and serializing a `LocalDate` cannot cross the UTC boundary. The trade-off is that a `LocalDate` cannot answer questions about instants, durations, or offsets; it is deliberately only a calendar date.

## Edge cases

`LocalDate.fromISO` accepts only the bare `YYYY-MM-DD` form. A string with a time or offset suffix (`2024-02-29T00:00:00Z`) is rejected with a `RangeError` rather than silently truncated, because accepting it would reintroduce exactly the UTC coupling the type exists to avoid. Years are written with at least four digits in `toISO`, so year 999 serializes as `0999-12-31`.
