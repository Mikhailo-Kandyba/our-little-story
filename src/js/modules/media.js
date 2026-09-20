const VIDEO_MIME = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  ogv: 'video/ogg',
  ogg: 'video/ogg',
  mov: 'video/quicktime'
};

let exclusiveBound = false;

export function mediaPath(item) {
  if (!item) {
    return '';
  }
  if (item.src) {
    return item.src;
  }
  return item.image || '';
}

export function isVideoItem(item) {
  if (!item) {
    return false;
  }
  if (item.type === 'video') {
    return true;
  }
  if (item.type === 'image') {
    return false;
  }
  return !!videoMime(mediaPath(item));
}

export function pointerOnVideo(event) {
  const target = event && event.target;
  if (!target || !target.closest) {
    return false;
  }
  return !!target.closest('video');
}

export function ensureExclusivePlayback() {
  if (exclusiveBound) {
    return;
  }
  exclusiveBound = true;
  document.addEventListener(
    'play',
    (event) => {
      const active = event.target;
      if (!active || active.tagName !== 'VIDEO') {
        return;
      }
      pauseOtherVideos(active);
    },
    true
  );
}

export function pauseOtherVideos(except) {
  const list = document.querySelectorAll('video');
  for (let i = 0; i < list.length; i++) {
    const video = list[i];
    if (video !== except && !video.paused) {
      video.pause();
    }
  }
}

export function videoMarkup(item, options) {
  const opts = options || {};
  const src = mediaPath(item);
  const poster = item && item.poster ? ' poster="' + attr(item.poster) + '"' : '';
  const mime = videoMime(src);
  const type = mime ? ' type="' + mime + '"' : '';
  const secret = opts.secret ? ' data-memory-secret="1"' : '';
  const label = attr((item && (item.title || item.alt || item.date)) || 'Відео');
  let preload = 'metadata';
  if (opts.lazy || keepsPreloadNone(src)) {
    preload = 'none';
  }
  const source = opts.lazy
    ? ''
    : '<source src="' + attr(src) + '"' + type + '>';

  return '<video class="story-video" controls playsinline webkit-playsinline preload="' +
    preload + '" draggable="false" aria-label="' +
    label + '"' + poster + secret +
    ' data-media-video data-lazy-src="' + attr(src) + '">' +
    source +
    '</video>';
}

export function ensureVideoSource(video, item) {
  if (!video) {
    return;
  }
  const src = item ? mediaPath(item) : video.getAttribute('data-lazy-src') || '';
  if (!src) {
    return;
  }
  const current = video.querySelector('source');
  if (current && current.getAttribute('src') === src) {
    if (video.preload === 'none' && !keepsPreloadNone(src)) {
      video.preload = 'metadata';
    }
    return;
  }
  while (video.firstChild) {
    video.removeChild(video.firstChild);
  }
  const source = document.createElement('source');
  source.src = src;
  const mime = videoMime(src);
  if (mime) {
    source.type = mime;
  }
  video.appendChild(source);
  video.setAttribute('data-lazy-src', src);
  video.preload = keepsPreloadNone(src) ? 'none' : 'metadata';
  video.load();
}

export function unloadVideoSource(video) {
  if (!video) {
    return;
  }
  video.pause();
  try {
    video.currentTime = 0;
  } catch (err) {
    // ignore seek errors on empty media
  }
  while (video.firstChild) {
    video.removeChild(video.firstChild);
  }
  video.removeAttribute('src');
  video.preload = 'none';
  video.load();
  video.removeAttribute('data-media-ready');
}

export function mountVideo(video, item) {
  const src = mediaPath(item);
  releaseVideo(video);
  video.hidden = false;
  video.controls = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('data-media-video', '');
  if (item && item.poster) {
    video.setAttribute('poster', item.poster);
  } else {
    video.removeAttribute('poster');
  }
  video.setAttribute('aria-label', (item && (item.title || item.alt || item.date)) || 'Відео');

  const source = document.createElement('source');
  source.src = src;
  const mime = videoMime(src);
  if (mime) {
    source.type = mime;
  }
  video.appendChild(source);
  video.setAttribute('data-lazy-src', src);
  video.preload = keepsPreloadNone(src) ? 'none' : 'metadata';
  if (video.preload === 'metadata') {
    video.load();
  }
}

export function releaseVideo(video) {
  if (!video) {
    return;
  }
  video.pause();
  video.removeAttribute('src');
  video.removeAttribute('poster');
  while (video.firstChild) {
    video.removeChild(video.firstChild);
  }
  video.load();
  video.hidden = true;
}

export function armVideoPreload(root) {
  if (!root) {
    return;
  }
  const videos = root.querySelectorAll('video[data-media-video]');
  if (!videos.length) {
    return;
  }
  if (!window.IntersectionObserver) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      primeVideo(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '280px 0px', threshold: 0.01 });

  videos.forEach((video) => observer.observe(video));
}

function primeVideo(video) {
  if (!video || video.getAttribute('data-media-ready') === '1') {
    return;
  }
  if (video.getAttribute('data-lazy-src') && !video.querySelector('source')) {
    return;
  }
  video.setAttribute('data-media-ready', '1');
  if (!video.paused || video.currentTime > 0) {
    return;
  }
  const source = video.querySelector('source');
  const src = source ? source.getAttribute('src') || '' : '';
  if (keepsPreloadNone(src)) {
    return;
  }
  video.preload = 'metadata';
  video.load();
}

function keepsPreloadNone(src) {
  return /\.mov(?:$|[?#])/i.test(src || '');
}

function videoMime(src) {
  return VIDEO_MIME[extOf(src)] || '';
}

function extOf(src) {
  const clean = String(src || '').split('?')[0].split('#')[0];
  const dot = clean.lastIndexOf('.');
  if (dot < 0) {
    return '';
  }
  return clean.slice(dot + 1).toLowerCase();
}

function attr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}
