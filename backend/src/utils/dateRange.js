const TZ = '+08:00';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function nowInTaipeiParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day)
  };
}

function buildTaipeiIso(year, month, day, endOfDay) {
  const time = endOfDay ? '23:59:59' : '00:00:00';
  return `${year}-${pad2(month)}-${pad2(day)}T${time}${TZ}`;
}

function parseCustomBound(value, endOfDay) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    return buildTaipeiIso(y, m, d, endOfDay);
  }

  if (trimmed.includes('T')) {
    if (!trimmed.includes('+') && !trimmed.endsWith('Z')) {
      return `${trimmed}${TZ}`;
    }
    return trimmed;
  }

  return null;
}

function addDaysTaipei(year, month, day, deltaDays) {
  const noonUtc = new Date(Date.UTC(year, month - 1, day, 4, 0, 0));
  noonUtc.setUTCDate(noonUtc.getUTCDate() + deltaDays);
  return {
    year: noonUtc.getUTCFullYear(),
    month: noonUtc.getUTCMonth() + 1,
    day: noonUtc.getUTCDate()
  };
}

/**
 * @returns {{ ok: true, range: string, from: string, to: string } | { ok: false, code: string, message: string }}
 */
function resolveDateRange(query) {
  const range = query.range;
  if (!range || !['7d', '30d', 'custom'].includes(range)) {
    return {
      ok: false,
      code: 'INVALID_RANGE',
      message: 'Query parameter range is required and must be 7d, 30d, or custom'
    };
  }

  if (range === 'custom') {
    const from = parseCustomBound(query.from, false);
    const to = parseCustomBound(query.to, true);
    if (!from || !to) {
      return {
        ok: false,
        code: 'INVALID_CUSTOM_RANGE',
        message: 'Custom range requires valid from and to (YYYY-MM-DD or ISO 8601)'
      };
    }
    if (from > to) {
      return {
        ok: false,
        code: 'INVALID_CUSTOM_RANGE',
        message: 'from must not be after to'
      };
    }
    return { ok: true, range, from, to };
  }

  const days = range === '7d' ? 6 : 29;
  const today = nowInTaipeiParts();
  const start = addDaysTaipei(today.year, today.month, today.day, -days);

  return {
    ok: true,
    range,
    from: buildTaipeiIso(start.year, start.month, start.day, false),
    to: buildTaipeiIso(today.year, today.month, today.day, true)
  };
}

function dateKeyFromIso(iso) {
  if (!iso) {
    return null;
  }
  return iso.slice(0, 10);
}

module.exports = {
  TZ,
  resolveDateRange,
  dateKeyFromIso,
  buildTaipeiIso
};
