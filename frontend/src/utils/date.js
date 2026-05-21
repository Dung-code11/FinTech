const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

const pad = (value) => String(value).padStart(2, '0');

const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

export const formatDateKey = (date) => {
  if (!isValidDate(date)) return '';

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const getTodayDateKey = () => formatDateKey(new Date());

export const extractDateKey = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    const match = value.match(ISO_DATE_PATTERN);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return isValidDate(parsed) ? formatDateKey(parsed) : '';
};

export const parseDateKey = (dateKey) => {
  const match = typeof dateKey === 'string'
    ? dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    : null;

  if (!match) return null;

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

export const formatDateKeyForDisplay = (dateKey, locale = 'vi-VN', options) => {
  const parsed = parseDateKey(dateKey);
  return parsed ? parsed.toLocaleDateString(locale, options) : '';
};

export const formatLocalDate = (value, locale = 'vi-VN', options) => {
  const dateKey = extractDateKey(value);
  if (dateKey) {
    return formatDateKeyForDisplay(dateKey, locale, options);
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return isValidDate(parsed) ? parsed.toLocaleDateString(locale, options) : '';
};

export const formatLocalTime = (
  value,
  locale = 'vi-VN',
  options = { hour: '2-digit', minute: '2-digit' }
) => {
  if (!value) return '';

  if (typeof value === 'string') {
    const match = value.match(/[T\s](\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return isValidDate(parsed) ? parsed.toLocaleTimeString(locale, options) : '';
};

export const getSortableTimestamp = (value) => {
  if (!value) return 0;

  const parsed = value instanceof Date ? value : new Date(value);
  if (isValidDate(parsed)) {
    return parsed.getTime();
  }

  const fallback = parseDateKey(extractDateKey(value));
  return fallback ? fallback.getTime() : 0;
};

export const toDateInputValue = (value, fallback = getTodayDateKey()) => {
  return extractDateKey(value) || fallback;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getStartOfWeek = (date) => {
  const current = new Date(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(current, diff);
};

export const getPeriodDateRange = (periodId, referenceDate = new Date()) => {
  const todayKey = formatDateKey(referenceDate);

  switch (periodId) {
    case 'today':
      return { startDate: todayKey, endDate: todayKey };
    case 'yesterday': {
      const yesterday = addDays(referenceDate, -1);
      const dateKey = formatDateKey(yesterday);
      return { startDate: dateKey, endDate: dateKey };
    }
    case 'week':
      return {
        startDate: formatDateKey(getStartOfWeek(referenceDate)),
        endDate: todayKey
      };
    case 'month':
      return {
        startDate: formatDateKey(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)),
        endDate: todayKey
      };
    default:
      return { startDate: '', endDate: '' };
  }
};
