import { Buffer } from 'buffer';
import { DateTime } from 'luxon';

export const convertNumericValuesToStringRecursive = (obj) => {
  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        newObj[key] = convertNumericValuesToStringRecursive(obj[key]); // Recursively call for nested objects
      } else if (typeof obj[key] === 'number') {
        newObj[key] = obj[key].toString();
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  return newObj;
};

export const getPayloadFromToken = (token) => {
  if (!token || token === '') return {};

  const encodedPayload = token.split('.')[1];
  const parsed = JSON.parse(Buffer.from(encodedPayload, 'base64'));

  for (const key in parsed) {
    try {
      let val = parsed[key];
      parsed[key] = JSON.parse(val);
      if (key === 'Roles') {
        let rolesArray = parsed[key];
        parsed['roles'] = rolesArray.map((x) => x.RoleID);
      }
    } catch (e) {
      continue;
    }
  }
  console.log('my parsed user info:', parsed);
  parsed['token'] = token;
  return parsed;
};

export const convertDateFull = (timeObj) => {
  const format = { ...DateTime.DATE_FULL };
  return DateTime.fromISO(timeObj).toLocaleString(format);
};

export const convertDateShort = (timeObj) => {
  const format = { ...DateTime.DATE_SHORT };
  return DateTime.fromISO(timeObj).toLocaleString(format);
};

export const range = (start, end, length = end - start) =>
  Array.from({ length }, (_, i) => start + i);

export const stateReducer = (state, action) => ({
  ...state,
  ...(typeof action === 'function' ? action(state) : action),
});

export const genDT = (seconds) =>
  DateTime.fromSeconds(seconds).toLocaleString(DateTime.TIME_24_SIMPLE);

export const genDTFromISO = (str) =>
  DateTime.fromISO(str).toLocaleString(DateTime.TIME_24_SIMPLE);
export const genDTFromISOWithDate = (str) => {
  let dt = DateTime.fromISO(str);
  return `${dt.toFormat('L')}/${dt.toFormat('dd')}: ${dt.toFormat('T')}`;
};
export const ShortDTFromSeconds = (seconds) => {
  let dt = DateTime.fromSeconds(seconds);
  return `${dt.toFormat('L')}/${dt.toFormat('dd')}: ${dt.toFormat('T')}`;
};

const units = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];

export const timeAgoFromSeconds = (seconds) => {
  let dt = DateTime.fromSeconds(seconds);
  const diff = dt.diffNow().shiftTo(...units);
  const unit = units.find((unit) => diff.get(unit) !== 0) || 'second';

  const relativeFormatter = new Intl.RelativeTimeFormat('en', {
    numeric: 'auto',
  });
  return relativeFormatter.format(Math.trunc(diff.as(unit)), unit);
};

export const genHoursFromISO = (isoStr, format = 24) => {
  let dt = DateTime.fromISO(isoStr);
  return (format = 24
    ? dt.toLocal().toFormat('HH')
    : dt.toLocal().toFormat('hh'));
};

export const checkWeatherConditions = (wxObject = {}) => {
  if (Object.keys(wxObject).length === 0 || wxObject?.error) return [];

  const alerts = [];

  const {
    clouds = null,
    dewp = null,
    snow = null,
    temp = null,
    vertVis = null,
    visib = null,
    wdir = null,
    wgst = null,
    wspd = null,
  } = wxObject;

  if (visib) {
    let vis =
      typeof visib === 'number'
        ? visib
        : visib.endsWith('+') || isNaN(visib)
          ? visib.slice(0, -1)
          : visib;

    if (Number(vis) <= 3) {
      alerts.push({ icon: 'vis', message: 'low visibility' });
    }
  }

  if (clouds && clouds.length > 0) {
    const icon = 'clouds';
    if (clouds.some((x) => ['OVC', 'OVX'].includes(x.cover))) {
      let item = clouds.find((x) => ['OVC', 'OVX'].includes(x.cover));
      alerts.push({
        icon,
        message: `${cloudDescriptions[item.cover]} @ ${item.base}`,
      });
    }
    if (clouds.some((x) => x.base !== null && Number(x.base) < 500)) {
      alerts.push({ icon, message: 'low clouds' });
    }
  }

  if (Number(wspd) > 5) {
    alerts.push({ icon: 'wind', message: 'high winds' });
  }

  if (Number(wgst) > 5) {
    alerts.push({ icon: 'wind-gusts', message: 'high gusts' });
  }

  if (vertVis) {
    alerts.push({ icon: 'no-vis', message: 'low clouds' });
  }

  if (temp > 27) {
    alerts.push({ icon: 'high-temp', message: 'high temp' });
  }

  return alerts;
};
