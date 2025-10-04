import { cloudCodes, wxCodes } from './metarCodes';

function analyzeWxPeriod(object, { windLimit = 10, altLimit = 400 }) {
  const alerts = [];

  const {
    clouds,
    wxString,
    wshearDir,
    wshearHgt,
    wshearSpd,
    dewp,
    snow,
    temp,
    vertVis,
    visib,
    wdir,
    wgst,
    wspd,
    timeFrom,
    timeTo,
  } = object;

  if (visib) {
    const vis =
      typeof visib === 'number'
        ? visib
        : visib.endsWith('+') || isNaN(visib)
          ? visib.slice(0, -1)
          : visib;
    if (vis && Number(vis) <= 3) {
      alerts.push({ icon: 'vis', message: `low visibility (${vis})` });
    }
  }

  if (clouds && clouds.length > 0) {
    const icon = 'clouds';

    const coverViolation = clouds.find(
      (x) =>
        ['OVC', 'BKN', 'SCT', 'OVX'].includes(x.cover) &&
        Number(x.base) < altLimit + 500
    );

    if (coverViolation) {
      const cover = coverViolation.cover;
      const base = coverViolation.base;
      const heigthStr = base === null ? '' : ` @ ${base}`;
      alerts.push({
        icon,
        message: `${cloudCodes[cover]}${heigthStr}`,
        ...(cover === 'OVX' && { extreme: true }),
      });
    }
  }

  if (wspd && Number(wspd) >= windLimit) {
    alerts.push({ icon: 'wind', message: `winds @ ${wspd}` });
  }

  if (wgst && Number(wgst) >= windLimit) {
    alerts.push({ icon: 'wind-gusts', message: `gusts @ ${wgst}` });
  }

  if (vertVis) {
    alerts.push({ icon: 'no-vis', message: `vv @ ${vertVis}`, extreme: true });
  }

  if (wxString) {
    const segments = wxString.split(' ');
    const parsed = segments.map((s) => {
      const descriptor = s.includes('+')
        ? wxCodes['+']
        : s.includes('-')
          ? wxCodes['-']
          : null;

      const trueString = s.replace(/[+-]/g, '');
      const components = trueString.match(/[\s\S]{1,2}/g) || [];
      const combinedWx = components.map((x) => wxCodes[x]).join(', ');
      return descriptor ? `${descriptor} ${combinedWx}` : combinedWx;
    });

    alerts.push({
      icon: 'wx',
      message: parsed.join('\n'),
    });
  }

  if (temp) {
    const tempF = Math.floor((temp * 9) / 5 + 32);
    alerts.push({ icon: 'temp', message: `temp @ ${tempF}` });
  }

  return alerts;
}

export const handleWeather = (wxObject = null, weatherLimits = {}) => {
  if (!wxObject) {
    return { error: 'WX Object must be provided' };
  }

  const { fcsts } = wxObject;

  if (fcsts) {
    //process taf
    const alerts = [];

    for (const period of fcsts) {
      const currentPeriod = {
        start: period.timeFrom,
        end: period.timeTo,
        alerts: analyzeWxPeriod(period, weatherLimits),
      };
      alerts.push(currentPeriod);
    }

    return alerts;
  } else {
    //process metar
    return analyzeWxPeriod(wxObject, weatherLimits);
  }
};
