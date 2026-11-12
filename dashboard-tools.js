'use strict';

(() => {
  let context = null;
  let security = { passkeys: [], sessions: [], passkeyVerified: false };
  let searchTimer = null;

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const bridge = () => window.NoctigardeDashboardBridge;
  const request = (path, options) => bridge()?.request(path, options);
  const encodeBase64Url = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let value = '';
    bytes.forEach(byte => { value += String.fromCharCode(byte); });
    return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  };
  const decodeBase64Url = (value) => {
    const base64 = String(value).replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    const binary = atob(base64);
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  };
  const credentialJson = (credential) => ({
    id: credential.id,
    rawId: encodeBase64Url(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: typeof credential.response.getTransports === 'function' ? {
      clientDataJSON: encodeBase64Url(credential.response.clientDataJSON),
      attestationObject: encodeBase64Url(credential.response.attestationObject),
      transports: credential.response.getTransports?.() || []
    } : {
      clientDataJSON: encodeBase64Url(credential.response.clientDataJSON),
      authenticatorData: encodeBase64Url(credential.response.authenticatorData),
      signature: encodeBase64Url(credential.response.signature),
      userHandle: credential.response.userHandle ? encodeBase64Url(credential.response.userHandle) : null
    }
  });

  function toast(message, type = 'success') {
    const stack = document.querySelector('[data-toasts]');
    if (!stack) return;
    const item = document.createElement('div');
    item.className = `toast ${type === 'error' ? 'is-error' : ''}`;
    item.textContent = message;
    stack.append(item);
    window.setTimeout(() => item.remove(), 4500);
  }

  function formatDate(value) {
    if (!value) return 'Jamais';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Inconnue' : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
  }

  function renderSearchResults(results) {
    const host = document.querySelector('[data-workspace-search-results]');
    if (!host) return;
    host.hidden = false;
    host.innerHTML = results.length ? results.map(item => `
      <button type="button" data-workspace-search-target="${escapeHtml(item.tab)}">
        <span>${escapeHtml(item.type)}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small>
      </button>
    `).join('') : '<p>Aucun résultat dans ce serveur.</p>';
  }

  function renderTemplates() {
    const templates = context?.state?.workspaceTools?.templates || [];
    return templates.map(template => `
      <article class="workspace-template">
        <div><strong>${escapeHtml(template.name)}</strong><small>${template.changes.length} changement(s) détecté(s)</small></div>
        ${template.unresolved.length ? `<p>${template.unresolved.map(escapeHtml).join(' · ')}</p>` : '<p>Les rôles et salons utiles ont été reconnus.</p>'}
        <button type="button" class="button button-small button-ghost" data-apply-template="${escapeHtml(template.id)}">Prévisualiser</button>
      </article>
    `).join('') || '<p class="muted">Aucun modèle disponible.</p>';
  }

  function renderHistory() {
    const history = context?.state?.workspaceTools?.configurationHistory || [];
    return history.slice(0, 8).map(item => `
      <article class="workspace-history-row">
        <div><strong>${escapeHtml(item.action)}</strong><small>${escapeHtml(formatDate(item.createdAt))}</small></div>
        <button type="button" class="button button-small button-ghost" data-restore-config="${item.id}">Restaurer l’état précédent</button>
      </article>
    `).join('') || '<p class="muted">L’historique commencera au prochain changement.</p>';
  }

  function renderSecurity() {
    const passkeys = security.passkeys || [];
    const sessions = security.sessions || [];
    return `
      <div class="workspace-security-grid">
        <section>
          <div class="workspace-section-heading"><div><strong>Passkeys</strong><small>Empreinte, visage, code appareil ou clé physique</small></div><button type="button" class="button button-small" data-add-passkey>Ajouter</button></div>
          ${passkeys.map(item => `<div class="workspace-history-row"><div><strong>${escapeHtml(item.name)}</strong><small>Dernière utilisation : ${escapeHtml(formatDate(item.lastUsedAt))}</small></div><button type="button" class="button button-small button-ghost" data-delete-passkey="${escapeHtml(item.id)}">Retirer</button></div>`).join('') || '<p class="muted">Aucune passkey enregistrée.</p>'}
        </section>
        <section>
          <div class="workspace-section-heading"><div><strong>Sessions actives</strong><small>${sessions.length} appareil(s) connecté(s)</small></div><button type="button" class="button button-small button-ghost" data-revoke-other-sessions>Fermer les autres</button></div>
          ${sessions.map(item => `<div class="workspace-history-row"><div><strong>${item.current ? 'Session actuelle' : 'Autre appareil'}</strong><small>${escapeHtml(item.device)} · ${escapeHtml(formatDate(item.createdAt))}</small></div>${item.current ? '<span class="status-badge is-ready">Ici</span>' : `<button type="button" class="button button-small button-ghost" data-revoke-session="${escapeHtml(item.id)}">Fermer</button>`}</div>`).join('')}
        </section>
      </div>
    `;
  }

  function renderTools() {
    const stage = document.querySelector('.dashboard-tab-stage');
    if (!stage || !context?.guildId || (!context?.state?.viewerAccess?.canManageGuild && !context?.state?.siteAccess?.canViewSitePanel)) return;
    document.querySelector('[data-workspace-tools]')?.remove();
    const panel = document.createElement('section');
    panel.className = 'workspace-tools';
    panel.dataset.workspaceTools = '';
    panel.innerHTML = `
      <div class="workspace-search">
        <label><span>Recherche dans ce serveur</span><input type="search" data-workspace-search placeholder="Membre, rôle, ticket, sanction ou réglage"></label>
        <div class="workspace-search-results" data-workspace-search-results hidden></div>
      </div>
      <details>
        <summary><span>Configuration guidée</span><small>Modèles, historique et permissions</small></summary>
        <div class="workspace-tool-grid">
          <section><h3>Modèles de serveur</h3><p>Prévisualise toujours les changements avant de les appliquer.</p><div class="workspace-stack">${renderTemplates()}</div></section>
          <section><h3>Historique</h3><p>Chaque changement de configuration peut être comparé puis restauré.</p><div class="workspace-stack">${renderHistory()}</div></section>
          <section>
            <h3>Simuler un accès</h3><p>Vérifie pourquoi un membre ou un rôle peut utiliser une action.</p>
            <form data-permission-simulator class="workspace-simulator">
              <select name="targetType"><option value="member">Membre</option><option value="role">Rôle</option></select>
              <input name="targetId" required pattern="\\d{17,20}" placeholder="ID Discord">
              <select name="capability"><option value="service">Services</option><option value="tickets">Tickets</option><option value="moderation">Modération</option><option value="timeout">Timeout</option><option value="kick">Exclusion</option><option value="ban">Bannissement</option><option value="configuration">Configuration</option></select>
              <button class="button button-small" type="submit">Vérifier</button>
            </form><div data-permission-result></div>
          </section>
        </div>
      </details>
      <details>
        <summary><span>Calendrier et assistance</span><small>Planning externe et diagnostic sans données privées</small></summary>
        <div class="workspace-quick-actions">
          <a class="button button-small button-ghost" href="/api/guilds/${context.guildId}/planning.ics">Télécharger le planning .ics</a>
          <button class="button button-small button-ghost" type="button" data-calendar-link>Créer un lien calendrier</button>
          <button class="button button-small button-ghost" type="button" data-support-report>Créer un diagnostic support</button>
        </div>
      </details>
      <details>
        <summary><span>Sécurité du compte</span><small>Passkeys et appareils connectés</small></summary>
        <div data-security-content>${renderSecurity()}</div>
      </details>
    `;
    stage.before(panel);
    bindTools(panel);
  }

  async function updateSecurity(action, payload = {}) {
    const response = await request('/api/me/security', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action, ...payload })
    });
    security = response.security || security;
    const host = document.querySelector('[data-security-content]');
    if (host) { host.innerHTML = renderSecurity(); bindTools(document.querySelector('[data-workspace-tools]')); }
    return response.result;
  }

  async function registerPasskey() {
    if (!window.PublicKeyCredential) throw new Error('Ce navigateur ne prend pas en charge les passkeys.');
    const name = window.prompt('Nom de cette passkey', 'Mon appareil') || 'Mon appareil';
    const options = await updateSecurity('passkey-register-options');
    options.challenge = decodeBase64Url(options.challenge);
    options.user.id = decodeBase64Url(options.user.id);
    options.excludeCredentials = (options.excludeCredentials || []).map(item => ({ ...item, id: decodeBase64Url(item.id) }));
    const credential = await navigator.credentials.create({ publicKey: options });
    await updateSecurity('passkey-register-finish', { name, response: credentialJson(credential) });
    toast('Passkey ajoutée et vérifiée.');
  }

  function bindTools(root) {
    if (!root || root.dataset.bound === 'true') return;
    root.dataset.bound = 'true';
    root.querySelector('[data-workspace-search]')?.addEventListener('input', event => {
      window.clearTimeout(searchTimer);
      const query = event.target.value.trim();
      if (query.length < 2) { const host = root.querySelector('[data-workspace-search-results]'); if (host) host.hidden = true; return; }
      searchTimer = window.setTimeout(async () => {
        try { renderSearchResults((await request(`/api/guilds/${context.guildId}/search?q=${encodeURIComponent(query)}`)).results || []); }
        catch (error) { toast(error.message, 'error'); }
      }, 250);
    });
    root.addEventListener('click', async event => {
      const targetButton = event.target.closest('[data-workspace-search-target]');
      if (targetButton) { document.querySelector(`[data-dashboard-tab="${CSS.escape(targetButton.dataset.workspaceSearchTarget)}"]`)?.click(); return; }
      const templateButton = event.target.closest('[data-apply-template]');
      if (templateButton) {
        const template = context.state.workspaceTools.templates.find(item => item.id === templateButton.dataset.applyTemplate);
        const summary = template.changes.map(item => `${item.key}: ${item.before || 'vide'} → ${item.after || 'vide'}`).join('\n');
        if (!window.confirm(`Appliquer le modèle ${template.name} ?\n\n${summary}`)) return;
        try { const payload = await request(`/api/guilds/${context.guildId}/templates`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ templateId: template.id, confirmation: 'APPLIQUER' }) }); context.state = payload.state; await bridge().refresh(); toast('Modèle appliqué.'); } catch (error) { toast(error.message, 'error'); }
        return;
      }
      const restoreButton = event.target.closest('[data-restore-config]');
      if (restoreButton && window.confirm('Restaurer la configuration qui précédait ce changement ?')) {
        try { await request(`/api/guilds/${context.guildId}/configuration-history`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ historyId: Number(restoreButton.dataset.restoreConfig) }) }); await bridge().refresh(); toast('Configuration restaurée.'); } catch (error) { toast(error.message, 'error'); }
        return;
      }
      if (event.target.closest('[data-calendar-link]')) {
        try { const payload = await request(`/api/guilds/${context.guildId}/calendar-token`, { method: 'POST' }); await navigator.clipboard.writeText(payload.url); toast('Lien calendrier copié. Il peut être ajouté à Google Agenda, Apple ou Outlook.'); } catch (error) { toast(error.message, 'error'); }
        return;
      }
      if (event.target.closest('[data-support-report]')) {
        try { const payload = await request(`/api/guilds/${context.guildId}/support-report`, { method: 'POST' }); await navigator.clipboard.writeText(payload.url); toast('Diagnostic anonyme copié. Il expirera dans 7 jours.'); } catch (error) { toast(error.message, 'error'); }
        return;
      }
      if (event.target.closest('[data-add-passkey]')) { try { await registerPasskey(); } catch (error) { toast(error.message, 'error'); } return; }
      const deletePasskey = event.target.closest('[data-delete-passkey]');
      if (deletePasskey && window.confirm('Retirer cette passkey ?')) { try { await updateSecurity('passkey-delete', { credentialId: deletePasskey.dataset.deletePasskey }); toast('Passkey retirée.'); } catch (error) { toast(error.message, 'error'); } return; }
      const revokeSession = event.target.closest('[data-revoke-session]');
      if (revokeSession) { try { await updateSecurity('session-revoke', { sessionId: revokeSession.dataset.revokeSession }); toast('Session fermée.'); } catch (error) { toast(error.message, 'error'); } return; }
      if (event.target.closest('[data-revoke-other-sessions]')) { try { await updateSecurity('sessions-revoke-others'); toast('Toutes les autres sessions sont fermées.'); } catch (error) { toast(error.message, 'error'); } }
    });
    root.querySelector('[data-permission-simulator]')?.addEventListener('submit', async event => {
      event.preventDefault();
      const body = Object.fromEntries(new FormData(event.currentTarget));
      const host = root.querySelector('[data-permission-result]');
      try {
        const payload = await request(`/api/guilds/${context.guildId}/permission-simulator`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
        host.innerHTML = `<div class="workspace-result ${payload.result.allowed ? 'is-ok' : 'is-warning'}"><strong>${payload.result.allowed ? 'Accès autorisé' : 'Accès refusé'}</strong><p>${payload.result.reasons.map(escapeHtml).join(' ')}</p></div>`;
      } catch (error) { host.innerHTML = `<div class="workspace-result is-warning"><strong>Vérification impossible</strong><p>${escapeHtml(error.message)}</p></div>`; }
    });
  }

  document.addEventListener('noctigarde:dashboard-rendered', event => {
    context = event.detail;
    security = event.detail.security || security;
    renderTools();
  });
})();
