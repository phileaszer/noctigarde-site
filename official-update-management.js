'use strict';

(() => {
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const formatDate = (value) => value ? new Intl.DateTimeFormat(
    document.documentElement.lang === 'en' ? 'en-US' : 'fr-FR',
    { dateStyle: 'short', timeStyle: 'short' }
  ).format(new Date(value)) : '';

  function renderManagement(updates = []) {
    return `
      <div class="panel-heading"><p class="eyebrow">Annonces publiées</p><h3>Modifier ou retirer</h3><p class="muted">Une modification est appliquée au site et à tous les messages Discord déjà livrés. Un retrait supprime les messages et masque l’annonce du site.</p></div>
      <div class="operation-list">
        ${updates.length ? updates.map(item => `
          <details class="operation-row official-update-manage-row">
            <summary><strong>Patchnote n°${escapeHtml(item.patchNumber || item.id)} · ${escapeHtml(item.titleFr)}</strong><small>${escapeHtml(formatDate(item.publishedAt))}</small></summary>
            <form data-founder-official-update-manage class="operation-form-grid">
              <input type="hidden" name="action" value="edit"><input type="hidden" name="updateId" value="${escapeHtml(item.id)}">
              <input name="titleFr" maxlength="256" value="${escapeHtml(item.titleFr)}" placeholder="Titre français" required>
              <textarea name="bodyFr" maxlength="4000" placeholder="Message français" required>${escapeHtml(item.bodyFr)}</textarea>
              <input name="titleEn" maxlength="256" value="${escapeHtml(item.titleEn || '')}" placeholder="Titre anglais facultatif">
              <textarea name="bodyEn" maxlength="4000" placeholder="Message anglais facultatif">${escapeHtml(item.bodyEn || '')}</textarea>
              <div class="inline-action-row"><button class="button button-small" type="submit">Soumettre la modification</button><button class="button button-small button-ghost" type="button" data-founder-official-update-delete data-update-id="${escapeHtml(item.id)}">Retirer partout</button></div>
            </form>
          </details>
        `).join('') : '<p class="muted">Aucune annonce publique.</p>'}
      </div>`;
  }

  function bindManagement(manage) {
    document.querySelectorAll('[data-founder-official-update-manage]').forEach(form => form.addEventListener('submit', event => {
      event.preventDefault();
      manage(Object.fromEntries(new FormData(form)), form.querySelector('button[type="submit"]'));
    }));
    document.querySelectorAll('[data-founder-official-update-delete]').forEach(button => button.addEventListener('click', () => {
      const text = 'Retirer cette annonce du site et de tous les serveurs ?';
      if (!window.confirm(window.NoctigardeI18n?.translate?.(text) || text)) return;
      manage({ action: 'delete', updateId: button.dataset.updateId }, button);
    }));
  }

  window.NoctigardeOfficialUpdates = { bindManagement, renderManagement };
})();
