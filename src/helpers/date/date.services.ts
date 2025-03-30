import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  private readonly BANGKOK_TIMEZONE = 'Asia/Bangkok';

  /**
   * Get current date in Bangkok timezone
   */
  getCurrentDate(): {
    date: string;
    timestamp: number;
    formattedDate: string;
  } {
    const bangkokTime = new Date().toLocaleString('en-US', {
      timeZone: this.BANGKOK_TIMEZONE,
    });

    const date = new Date(bangkokTime);

    return {
      date: date.toISOString(),
      timestamp: date.getTime(),
      formattedDate: this.formatDate(date),
    };
  }

  /**
   * Format date to YYYY-MM-DD HH:mm:ss
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Format date to YYYY-MM-DD
   */
  formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Get start and end of day in Bangkok timezone
   */
  getDayStartEnd(date: Date = new Date()): {
    startOfDay: Date;
    endOfDay: Date;
  } {
    const bangkokDate = new Date(
      date.toLocaleString('en-US', {
        timeZone: this.BANGKOK_TIMEZONE,
      }),
    );

    const startOfDay = new Date(bangkokDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(bangkokDate.setHours(23, 59, 59, 999));

    return { startOfDay, endOfDay };
  }

  /**
   * Add days to a date
   */
  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Subtract days from a date
   */
  subtractDays(date: Date, days: number): Date {
    return this.addDays(date, -days);
  }

  /**
   * Get date range (start and end dates)
   */
  getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate = this.addDays(currentDate, 1);
    }

    return dates;
  }

  /**
   * Check if date is within range
   */
  isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  /**
   * Get relative time string (e.g., "2 hours ago", "in 3 days")
   */
  getRelativeTimeString(date: Date): string {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const now = new Date(this.getCurrentDate().timestamp);
    const diff = date.getTime() - now.getTime();
    const diffInDays = Math.round(diff / (1000 * 60 * 60 * 24));

    if (Math.abs(diffInDays) < 1) {
      const diffInHours = Math.round(diff / (1000 * 60 * 60));
      if (Math.abs(diffInHours) < 1) {
        const diffInMinutes = Math.round(diff / (1000 * 60));
        return rtf.format(diffInMinutes, 'minute');
      }
      return rtf.format(diffInHours, 'hour');
    }

    return rtf.format(diffInDays, 'day');
  }

  /**
   * Parse date string with flexible format
   */
  parseDate(dateString: string): Date | null {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Format date with custom locale and options
   */
  formatWithLocale(
    date: Date,
    locale: string = 'en-US',
    format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  ): string {
    return new Intl.DateTimeFormat(locale, {
      timeZone: this.BANGKOK_TIMEZONE,
      dateStyle: format,
      timeStyle: format,
    }).format(date);
  }

  /**
   * Get week number of the year
   */
  getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Check if year is leap year
   */
  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Get quarter of the year (1-4)
   */
  getQuarter(date: Date): number {
    return Math.ceil((date.getMonth() + 1) / 3);
  }

  /**
   * Get first and last dates of month
   */
  getMonthStartEnd(date: Date = new Date()): {
    firstDay: Date;
    lastDay: Date;
  } {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { firstDay, lastDay };
  }

  /**
   * Compare dates (ignoring time)
   */
  compareDates(date1: Date, date2: Date): -1 | 0 | 1 {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
  }

  /**
   * Get current week range (Sunday to Saturday) in Bangkok timezone
   */
  getCurrentWeekRange(): {
    startOfWeek: Date;
    endOfWeek: Date;
    weekDays: Date[];
  } {
    const today = new Date(
      new Date().toLocaleString('en-US', {
        timeZone: this.BANGKOK_TIMEZONE,
      }),
    );

    // Get Sunday (start of week)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get Saturday (end of week)
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    // Get all days of the week
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return { startOfWeek, endOfWeek, weekDays };
  }

  /**
   * Get week range for a specific date in Bangkok timezone
   */
  getWeekRange(date: Date): {
    startOfWeek: Date;
    endOfWeek: Date;
    weekDays: Date[];
  } {
    const targetDate = new Date(
      date.toLocaleString('en-US', {
        timeZone: this.BANGKOK_TIMEZONE,
      }),
    );

    // Get Sunday (start of week)
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get Saturday (end of week)
    const endOfWeek = new Date(targetDate);
    endOfWeek.setDate(targetDate.getDate() + (6 - targetDate.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    // Get all days of the week
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return { startOfWeek, endOfWeek, weekDays };
  }

  /**
   * Get day name of the week
   */
  getDayName(
    date: Date,
    format: 'long' | 'short' = 'long',
    locale: string = 'en-US',
  ): string {
    return date.toLocaleDateString(locale, { weekday: format });
  }

  /**
   * Get current day of week (0-6, 0 = Sunday)
   */
  getCurrentDayOfWeek(): number {
    return new Date(
      new Date().toLocaleString('en-US', {
        timeZone: this.BANGKOK_TIMEZONE,
      }),
    ).getDay();
  }

  getStartOfDay = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  getEndOfDay = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(23, 59, 59, 999);
    return normalized;
  };

  isSameDay(date1: Date, date2: Date) {
    return (
      this.getStartOfDay(date1).getTime() ===
      this.getStartOfDay(date2).getTime()
    );
  }

  dayLeft(from: Date, to: Date): number {
    const diffTime = to.getTime() - from.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
