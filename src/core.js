const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Returns true if the given year is a leap year in the proleptic Gregorian calendar.
 * The rule is: divisible by 4, except centuries not divisible by 400.
 */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the number of days in the given month of the given year.
 * Month is 1-based (1 = January, 12 = December).
 */
function daysInMonth(year, month) {
  if (month === 2 && isLeapYear(year)) return 29;
  return DAYS_IN_MONTH[month - 1];
}

/**
 * A calendar-only date: a year, month, and day with no time, no timezone,
 * and no UTC timestamp behind it. Two LocalDate values are equal exactly when
 * their year, month, and day are equal.
 *
 * We deliberately avoid Date objects and epoch milliseconds. The whole point is
 * that constructing, comparing, and serializing a LocalDate never crosses the
 * UTC boundary, so there is no midnight-shift bug when the host timezone is
 * behind or ahead of UTC.
 */
export class LocalDate {
  /**
   * @param {number} year - full year (e.g. 2024). No two-digit shorthand.
   * @param {number} month - 1-based month (1 = January, 12 = December).
   * @param {number} day - 1-based day of month.
   * @throws {TypeError} if any argument is not a finite integer.
   * @throws {RangeError} if the triple does not name a real calendar date.
   */
  constructor(year, month, day) {
    if (!Number.isInteger(year)) {
      throw new TypeError('year must be a finite integer');
    }
    if (!Number.isInteger(month)) {
      throw new TypeError('month must be a finite integer');
    }
    if (!Number.isInteger(day)) {
      throw new TypeError('day must be a finite integer');
    }
    if (month < 1 || month > 12) {
      throw new RangeError('month must be between 1 and 12');
    }
    const maxDay = daysInMonth(year, month);
    if (day < 1 || day > maxDay) {
      throw new RangeError(`day must be between 1 and ${maxDay} for ${year}-${month}`);
    }
    this.year = year;
    this.month = month;
    this.day = day;
    Object.freeze(this);
  }

  /**
   * Creates a LocalDate from an ISO 8601 calendar-date string (YYYY-MM-DD).
   * Only the date part is accepted; a time or offset suffix is rejected so that
   * callers cannot accidentally smuggle a UTC instant into a calendar type.
   * @param {string} iso - e.g. '2024-02-29'.
   * @returns {LocalDate}
   * @throws {TypeError} if the input is not a string.
   * @throws {RangeError} if the string is not a valid calendar date.
   */
  static fromISO(iso) {
    if (typeof iso !== 'string') {
      throw new TypeError('iso must be a string');
    }
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) {
      throw new RangeError(`invalid ISO date: ${iso}`);
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    return new LocalDate(year, month, day);
  }

  /**
   * Returns the ISO 8601 calendar-date string (YYYY-MM-DD).
   * Years outside 0000-9999 are padded to at least four digits; the format is
   * still unambiguous because it is always a signed-free decimal year.
   * @returns {string}
   */
  toISO() {
    const y = String(this.year).padStart(4, '0');
    const m = String(this.month).padStart(2, '0');
    const d = String(this.day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Returns true when the other value is a LocalDate with the same year, month,
   * and day. We compare fields directly rather than delegating to a timestamp,
   * which is what keeps the comparison timezone-independent.
   * @param {unknown} other
   * @returns {boolean}
   */
  equals(other) {
    return (
      other instanceof LocalDate &&
      this.year === other.year &&
      this.month === other.month &&
      this.day === other.day
    );
  }

  /**
   * Returns the day of the week as an integer, 0 = Sunday through 6 = Saturday.
   * This is pure calendar arithmetic (Zeller's congruence on the proleptic
   * Gregorian calendar) and never consults the host timezone.
   * @returns {number}
   */
  dayOfWeek() {
    let y = this.year;
    let m = this.month;
    if (m < 3) {
      m += 12;
      y -= 1;
    }
    const k = y % 100;
    const j = Math.floor(y / 100);
    // Zeller's congruence returns 0 = Saturday; shift so 0 = Sunday.
    const h = (this.day + Math.floor((13 * (m + 1)) / 5) + k + Math.floor(k / 4) + Math.floor(j / 4) + 5 * j) % 7;
    return (h + 6) % 7;
  }
}
