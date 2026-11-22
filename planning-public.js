'use strict';

(() => {
  const copy = {
    fr: {
      live: 'Planning en ligne', eyebrow: 'Planning partagé', refresh: 'Actualiser',
      upcoming: 'À venir', all: 'Tous', past: 'Passés', automatic: 'Ce planning se met à jour automatiquement.',
      loadingTitle: 'Chargement du planning…', loadingSummary: 'Les événements vont apparaître ici.',
      loading: 'Connexion au planning…', updated: 'Mis à jour à', empty: 'Aucun événement dans cette vue.',
      unavailable: 'Ce planning est indisponible ou son lien n’est plus valide.', retry: 'Réessaie dans quelques instants.',
      cancelled: 'Annulé', full: 'Complet', places: 'places', present: 'présent(s)', absent: 'absent(s)', maybe: 'peut-être',
      from: 'de', to: 'à', eventCount: 'événement(s) enregistré(s)'
    },
    en: {
      live: 'Online schedule', eyebrow: 'Shared schedule', refresh: 'Refresh',
      upcoming: 'Upcoming', all: 'All', past: 'Past', automatic: 'This schedule updates automatically.',
      loadingTitle: 'Loading schedule…', loadingSummary: 'Events will appear here.',
      loading: 'Connecting to schedule…', updated: 'Updated at', empty: 'No events in this view.',
      unavailable: 'This schedule is unavailable or its link is no longer valid.', retry: 'Try again in a moment.',
      cancelled: 'Cancelled', full: 'Full', places: 'spots', present: 'attending', absent: 'not attending', maybe: 'maybe',
      from: 'from', to: 'to', eventCount: 'saved event(s)'
    }
  };

  function language() {
    try {
      const stored = localStorage.getItem('sentinel-site-language');
      if (stored === 'en' || stored === 'fr') return stored;
    } catch {}
    return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
  }

  const lang = language();
  const text = copy[lang];
  const locale = lang === 'en' ? 'en-GB' : 'fr-FR';
  const token = new URLSearchParams(location.search).get('token') || '';
  const title = document.querySelector('[data-planning-title]');
  const summary = document.querySelector('[data-planning-summary]');
  const status = document.querySelector('[data-planning-status]');
  const eventsHost = document.querySelector('[data-planning-events]');
  const refreshButton = document.querySelector('[data-planning-refresh]');
  let calendar = null;
  let activeFilter = 'upcoming';

  document.documentElement.lang = lang;
  document.querySelectorAll('[data-copy]').forEach(element => {
    element.textContent = text[element.dataset.copy] || element.textContent;
  });
  title.textContent = text.loadingTitle;
  summary.textContent = text.loadingSummary;
  status.textContent = text.loading;

  const fullDate = new Intl.DateTimeFormat(locale, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });
  const shortMonth = new Intl.DateTimeFormat(locale, { month: 'short' });

  function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }

  function visibleShifts() {
    const now = Date.now();
    const shifts = [...(calendar?.shifts || [])];
    if (activeFilter === 'upcoming') {
      return shifts.filter(item => new Date(item.endsAt).getTime() >= now)
        .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    }
    if (activeFilter === 'past') {
      return shifts.filter(item => new Date(item.endsAt).getTime() < now)
        .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));
    }
    return shifts.sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));
  }

  function renderEvent(item) {
    const startsAt = new Date(item.startsAt);
    const endsAt = new Date(item.endsAt);
    const article = element('article', 'public-planning-event');
    if (item.status === 'cancelled') article.classList.add('is-cancelled');

    const date = element('time', 'public-planning-date');
    date.dateTime = item.startsAt;
    date.append(element('strong', '', String(startsAt.getDate()).padStart(2, '0')));
    date.append(element('span', '', shortMonth.format(startsAt).replace('.', '')));

    const content = element('div', 'public-planning-event-content');
    const heading = element('div', 'public-planning-event-heading');
    heading.append(element('h2', '', item.title));
    if (item.status === 'cancelled') heading.append(element('span', 'public-planning-state', text.cancelled));
    content.append(heading);

    const schedule = element('p', 'public-planning-schedule');
    schedule.append(`${fullDate.format(startsAt)} · ${text.from} `);
    schedule.append(element('time', '', time.format(startsAt)));
    schedule.append(` ${text.to} `);
    schedule.append(element('time', '', time.format(endsAt)));
    content.append(schedule);
    if (item.description) content.append(element('p', 'public-planning-description', item.description));

    const meta = element('div', 'public-planning-meta');
    if (item.capacity > 0) {
      const capacity = `${item.counts.available}/${item.capacity} ${text.places}`;
      meta.append(element('span', item.counts.available >= item.capacity ? 'is-full' : '', item.counts.available >= item.capacity ? `${capacity} · ${text.full}` : capacity));
    }
    meta.append(element('span', '', `${item.counts.available} ${text.present}`));
    meta.append(element('span', '', `${item.counts.unavailable} ${text.absent}`));
    if (item.counts.maybe > 0) meta.append(element('span', '', `${item.counts.maybe} ${text.maybe}`));
    content.append(meta);
    article.append(date, content);
    return article;
  }

  function render() {
    const shifts = visibleShifts();
    eventsHost.replaceChildren();
    if (!shifts.length) {
      eventsHost.append(element('div', 'public-planning-empty', text.empty));
      return;
    }
    shifts.forEach(item => eventsHost.append(renderEvent(item)));
  }

  async function load() {
    if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) {
      title.textContent = text.unavailable;
      summary.textContent = text.retry;
      status.textContent = '';
      eventsHost.replaceChildren();
      return;
    }
    refreshButton.disabled = true;
    status.textContent = text.loading;
    try {
      const response = await fetch(`/api/calendar/${encodeURIComponent(token)}`, { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.calendar) throw new Error(payload.error || text.unavailable);
      calendar = payload.calendar;
      title.textContent = calendar.server;
      summary.textContent = `${calendar.shifts.length} ${text.eventCount}`;
      document.title = `${calendar.server} | Noctigarde`;
      status.textContent = `${text.updated} ${time.format(new Date(calendar.generatedAt))}`;
      render();
    } catch {
      title.textContent = text.unavailable;
      summary.textContent = text.retry;
      status.textContent = '';
      eventsHost.replaceChildren(element('div', 'public-planning-empty is-error', text.unavailable));
    } finally {
      refreshButton.disabled = false;
    }
  }

  document.querySelectorAll('[data-planning-filter]').forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.planningFilter;
      document.querySelectorAll('[data-planning-filter]').forEach(item => item.classList.toggle('is-active', item === button));
      render();
    });
  });
  refreshButton.addEventListener('click', load);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) load();
  });
  setInterval(load, 5 * 60 * 1000);
  load();
})();
