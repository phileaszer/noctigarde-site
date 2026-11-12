'use strict';

(() => {
  const host = document.querySelector('[data-diagnostic-report]');
  const token = new URLSearchParams(window.location.search).get('token') || '';
  const escapeHtml = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  async function load() {
    if (!/^[A-Za-z0-9_-]{20,80}$/.test(token)) throw new Error('Ce lien de diagnostic est invalide.');
    const response = await fetch(`/api/support-report/${encodeURIComponent(token)}`, { headers: { accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Ce diagnostic a expiré.');
    const report = payload.report;
    host.innerHTML = `
      <div class="panel-heading"><div><p class="eyebrow">Serveur analysé</p><h2>${escapeHtml(report.server)}</h2></div><span class="status-badge is-ready">Rapport anonyme</span></div>
      <div class="diagnostic-public-summary">
        <article><span>Profil</span><strong>${escapeHtml(report.configuration.preset)}</strong><small>Langue : ${escapeHtml(report.configuration.language)}</small></article>
        <article><span>Accès responsables</span><strong>${Number(report.configuration.rolesConfigured)}</strong><small>rôle(s) configuré(s)</small></article>
        <article><span>Incidents ouverts</span><strong>${Number(report.health.openIncidents)}</strong><small>au moment du rapport</small></article>
      </div>
      <div class="diagnostic-public-list">
        ${(report.diagnostics || []).map(check => `<article class="${check.ok ? 'is-ok' : 'is-warning'}"><span>${check.ok ? 'Conforme' : 'À corriger'}</span><strong>${escapeHtml(check.label)}</strong>${check.fix ? `<p>${escapeHtml(check.fix)}</p>` : ''}</article>`).join('') || '<p>Aucun contrôle enregistré.</p>'}
      </div>
      <p class="muted">Généré le ${escapeHtml(new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(report.generatedAt)))}</p>
    `;
    window.NoctigardeI18n?.apply?.();
  }

  load().catch(error => {
    host.innerHTML = `<div class="empty-state"><h2>Diagnostic indisponible</h2><p>${escapeHtml(error.message)}</p></div>`;
  });
})();
