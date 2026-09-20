import {
  VISITOR_ID_KEY,
  VISITOR_NAME_KEY,
  VISITOR_NAME_MAX
} from '../siteConfig';

export function normalizeVisitorName(raw) {
  const name = String(raw == null ? '' : raw).trim().replace(/\s+/g, ' ');
  if (!name) {
    return '';
  }
  if (name.length > VISITOR_NAME_MAX) {
    return name.slice(0, VISITOR_NAME_MAX);
  }
  return name;
}

export function getVisitorName() {
  try {
    return normalizeVisitorName(window.localStorage.getItem(VISITOR_NAME_KEY) || '');
  } catch (err) {
    return '';
  }
}

export function setVisitorName(raw) {
  const name = normalizeVisitorName(raw);
  if (!name) {
    return '';
  }
  try {
    window.localStorage.setItem(VISITOR_NAME_KEY, name);
  } catch (err) {
    // ignore quota / private mode
  }
  return name;
}

export function getVisitorId() {
  try {
    let id = window.localStorage.getItem(VISITOR_ID_KEY);
    if (id && /^[a-zA-Z0-9_-]{8,64}$/.test(id)) {
      return id;
    }
    id = createVisitorId();
    window.localStorage.setItem(VISITOR_ID_KEY, id);
    return id;
  } catch (err) {
    return createVisitorId();
  }
}

export function ensureVisitorSession() {
  return {
    visitorName: getVisitorName(),
    visitorId: getVisitorId()
  };
}

export function detectDeviceLabel(ua) {
  const agent = String(ua || (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '');
  if (!agent) {
    return 'Unknown';
  }
  let os = 'Unknown';
  if (/iPhone|iPod/i.test(agent)) {
    os = 'iPhone';
  } else if (/iPad/i.test(agent)) {
    os = 'iPad';
  } else if (/Android/i.test(agent)) {
    os = 'Android';
  } else if (/Mac OS X/i.test(agent)) {
    os = 'Mac';
  } else if (/Windows/i.test(agent)) {
    os = 'Windows';
  } else if (/Linux/i.test(agent)) {
    os = 'Linux';
  }

  let browser = 'Unknown';
  if (/CriOS/i.test(agent)) {
    browser = 'Chrome';
  } else if (/FxiOS/i.test(agent)) {
    browser = 'Firefox';
  } else if (/EdgiOS|Edg\//i.test(agent)) {
    browser = 'Edge';
  } else if (/OPiOS|OPR\//i.test(agent)) {
    browser = 'Opera';
  } else if (/Android/i.test(agent) && /Chrome/i.test(agent)) {
    browser = 'Chrome';
  } else if (/Chrome/i.test(agent) && !/Edg\//i.test(agent)) {
    browser = 'Chrome';
  } else if (/Safari/i.test(agent) && !/Chrome|CriOS|Chromium/i.test(agent)) {
    browser = 'Safari';
  } else if (/Firefox/i.test(agent)) {
    browser = 'Firefox';
  }

  if (os === 'Unknown' && browser === 'Unknown') {
    return agent.slice(0, 80);
  }
  return os + ' / ' + browser;
}

function createVisitorId() {
  return 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}
