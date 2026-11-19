(() => {
  const STORAGE_KEY = 'sentinel-site-language';
  const textOriginals = new WeakMap();
  const titleOriginal = document.title;
  let isTranslating = false;

  const { en, placeholderEn } = window.NoctigardeI18nData || { en: {}, placeholderEn: {} };

  let normalizedTranslations = null;

  function normalizeTranslationKey(value) {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/…/g, '...')
      .replace(/[–—]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getNormalizedTranslation(value) {
    if (!normalizedTranslations) {
      normalizedTranslations = new Map();

      for (const [key, translated] of [...Object.entries(en), ...Object.entries(placeholderEn)]) {
        normalizedTranslations.set(normalizeTranslationKey(key), translated);
      }
    }

    return normalizedTranslations.get(normalizeTranslationKey(value));
  }

  function currentLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'fr' || saved === 'en') return saved;
    return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
  }

  function translateValue(value, language) {
    if (language === 'fr') return value;
    const exact = en[value] || placeholderEn[value];
    if (exact) return exact;
    const normalized = getNormalizedTranslation(value);
    if (normalized) return normalized;
    const normalizedValue = normalizeTranslationKey(value);

    let match = /^Gratuit : (\d+)\/(\d+) embeds actifs utilises\. Restant : (\d+)\. Modifications illimitees\.$/.exec(normalizedValue);
    if (match) return `Free: ${match[1]}/${match[2]} active embeds used. Remaining: ${match[3]}. Unlimited edits.`;

    match = /^Commande copiee : (.+)$/.exec(normalizedValue);
    if (match) return `Command copied: ${match[1]}`;

    match = /^#(.+) - (.+)$/.exec(normalizedValue);
    if (match) return `#${match[1]} - ${match[2]}`;

    match = /^(\d+) entree\(s\) affichee\(s\)$/.exec(normalizedValue);
    if (match) return `${match[1]} displayed entr${match[1] === '1' ? 'y' : 'ies'}`;

    match = /^(\d+) creneau\(x\) a venir\. Choisis une feuille de calcul ou ton calendrier\.$/.exec(normalizedValue);
    if (match) return `${match[1]} upcoming shift${match[1] === '1' ? '' : 's'}. Choose a spreadsheet or your calendar.`;

    match = /^Actuel : (.+)\. Diffusion : (.+)\.$/.exec(normalizedValue);
    if (match) return `Current: ${translateValue(match[1], language)}. Delivery: ${translateValue(match[2], language)}.`;

    match = /^Actuel : (.+)$/.exec(normalizedValue);
    if (match) return `Current: ${translateValue(match[1], language)}`;

    match = /^Affichage limite aux (\d+) derniers dossiers(?: visibles)? (?:pour|sur) ce serveur\.$/.exec(normalizedValue);
    if (match) return `Display limited to the latest ${match[1]} tickets for this server.`;

    match = /^(\d+) copie\(s\)$/.exec(normalizedValue);
    if (match) return `${match[1]} cop${match[1] === '1' ? 'y' : 'ies'}`;

    match = /^(\d+) ligne\(s\)$/.exec(normalizedValue);
    if (match) return `${match[1]} line${match[1] === '1' ? '' : 's'}`;

    match = /^(\d+) lot\(s\) consultable\(s\)$/.exec(normalizedValue);
    if (match) return `${match[1]} available batch${match[1] === '1' ? '' : 'es'}`;

    match = /^(\d+) objet\(s\) · plafond (.+)$/.exec(normalizedValue);
    if (match) return `${match[1]} object${match[1] === '1' ? '' : 's'} · limit ${match[2]}`;

    match = /^(\d+) objet\(s\) · (.+)$/.exec(normalizedValue);
    if (match) return `${match[1]} object${match[1] === '1' ? '' : 's'} · ${match[2]}`;

    match = /^(\d+) ouvert\(s\)$/.exec(normalizedValue);
    if (match) return `${match[1]} open`;

    match = /^(\d+) quotidiennes · (\d+) hebdomadaires · (\d+) mensuelles$/.exec(normalizedValue);
    if (match) return `${match[1]} daily · ${match[2]} weekly · ${match[3]} monthly`;

    match = /^(\d+) serveur\(s\)$/.exec(normalizedValue);
    if (match) return `${match[1]} server${match[1] === '1' ? '' : 's'}`;

    match = /^(\d+) signalement\(s\) dans le registre recent\.$/.exec(normalizedValue);
    if (match) return `${match[1]} report${match[1] === '1' ? '' : 's'} in the recent register.`;

    match = /^(\d+)\/(\d+) mot\(s\) configures\.$/.exec(normalizedValue);
    if (match) return `${match[1]}/${match[2]} configured word${match[1] === '1' ? '' : 's'}.`;

    match = /^#(.+) · sanction #(.+) · membre (.+)$/.exec(normalizedValue);
    if (match) return `#${match[1]} · sanction #${match[2]} · member ${match[3]}`;

    match = /^Controle #(.+)$/.exec(normalizedValue);
    if (match) return `Check #${match[1]}`;

    match = /^(.+) · controle #(.+)$/.exec(normalizedValue);
    if (match) return `${translateValue(match[1], language)} · check #${match[2]}`;

    match = /^(.+) · simulation uniquement$/.exec(normalizedValue);
    if (match) return `${match[1]} · simulation only`;

    match = /^(.+) au (.+)e avertissement$/.exec(normalizedValue);
    if (match) return `${translateValue(match[1], language)} at warning ${match[2]}`;

    match = /^(.+) message\(s\) · (.+) retire\(s\)$/.exec(normalizedValue);
    if (match) return `${match[1]} message(s) · ${match[2]} removed`;

    match = /^(.+) messages, (.+) pieces jointes et (.+) contenus integres\.$/.exec(normalizedValue);
    if (match) return `${match[1]} messages, ${match[2]} attachments, and ${match[3]} embeds.`;

    match = /^Archive #(.+) · (.+) · (.+)$/.exec(normalizedValue);
    if (match) return `Archive no. ${match[1]} · ${match[2]} · ${translateValue(match[3], language)}`;

    match = /^Dernier controle : (.+)$/.exec(normalizedValue);
    if (match) return `Latest check: ${match[1]}`;

    match = /^Prochain envoi : (.+)$/.exec(normalizedValue);
    if (match) return `Next delivery: ${match[1]}`;

    match = /^(.+) entree\(s\) · (.+)$/.exec(normalizedValue);
    if (match) return `${match[1]} entries · ${match[2]}`;

    match = /^(.+) · demande par (.+) · (.+)$/.exec(normalizedValue);
    if (match) return `${match[1]} · requested by ${match[2]} · ${match[3]}`;

    match = /^(.+) · (.+) occurrence\(s\) · (.+)$/.exec(normalizedValue);
    if (match) return `${match[1]} · ${match[2]} occurrence${match[2] === '1' ? '' : 's'} · ${match[3]}`;

    match = /^Une validation reste valable cinq minutes dans cette session\. Codes de secours restants : (.+)\.$/.exec(normalizedValue);
    if (match) return `A verification remains valid for five minutes in this session. Recovery codes remaining: ${match[1]}.`;

    match = /^(.+) information\(s\)$/.exec(normalizedValue);
    if (match) return `${match[1]} item(s)`;

    match = /^Cas #(.+)$/.exec(normalizedValue);
    if (match) return `Case #${match[1]}`;

    match = /^Ticket #(.+) · (.+)$/.exec(normalizedValue);
    if (match) return `Ticket no. ${match[1]} · ${translateValue(match[2], language)}`;

    match = /^Creee par (.+) · un autre responsable doit la valider$/.exec(normalizedValue);
    if (match) return `Created by ${match[1]} · another manager must approve it`;

    match = /^Nouveau salon : #(.+) · ID (.+)$/.exec(normalizedValue);
    if (match) return `New channel: #${match[1]} · ID ${match[2]}`;

    match = /^Retirer le role (.+) de la categorie (.+)$/.exec(normalizedValue);
    if (match) return `Remove role ${match[1]} from category ${match[2]}`;

    match = /^Seuil (.+) :$/.exec(normalizedValue);
    if (match) return `Threshold ${match[1]}:`;

    match = /^Validee par (.+) le (.+)$/.exec(normalizedValue);
    if (match) return `Approved by ${match[1]} on ${match[2]}`;

    match = /^(\d+)\/5 etapes pretes$/.exec(normalizedValue);
    if (match) return `${match[1]}/5 steps ready`;

    match = /^(\d+)\/5 a finaliser$/.exec(normalizedValue);
    if (match) return `${match[1]}/5 to finish`;

    match = /^Derniere lecture : (.+)$/.exec(normalizedValue);
    if (match) return `Last checked: ${match[1]}`;

    match = /^Action Noctigarde depuis bouton Discord\.$/.exec(normalizedValue);
    if (match) return 'Noctigarde action from a Discord button.';

    match = /^Action Noctigarde depuis commande Discord\.$/.exec(normalizedValue);
    if (match) return 'Noctigarde action from a Discord command.';

    match = /^Action Noctigarde depuis une commande texte Discord\.$/.exec(normalizedValue);
    if (match) return 'Noctigarde action from a Discord text command.';

    match = /^Embed Noctigarde envoye dans #(.+)\. ID : (.+)\. Quota Premium : acces illimite aux embeds\.$/.exec(normalizedValue);
    if (match) return `Noctigarde embed sent in #${match[1]}. ID: ${match[2]}. Unlimited embed access.`;

    match = /^Paie RP archivee pour (.+)\.$/.exec(normalizedValue);
    if (match) return `Salary register archived for ${match[1]}.`;

    match = /^Embed Noctigarde (.+) supprime\.$/.exec(normalizedValue);
    if (match) return `Noctigarde embed ${match[1]} deleted.`;

    match = /^Embed Noctigarde (.+) modifie\.$/.exec(normalizedValue);
    if (match) return `Noctigarde embed ${match[1]} edited.`;

    match = /^Profil serveur mis a jour : (.+)\.$/.exec(normalizedValue);
    if (match) return `Server profile updated: ${match[1]}.`;

    match = /^Panneau de service publie dans #(.+)\.$/.exec(normalizedValue);
    if (match) return `Duty desk published in #${match[1]}.`;

    match = /^Salon statut Noctigarde configure : #(.+)\.$/.exec(normalizedValue);
    if (match) return `Noctigarde status channel configured: #${match[1]}.`;

    match = /^Les nouveautes officielles Noctigarde pourront etre envoyees dans le salon statut\.$/.exec(normalizedValue);
    if (match) return 'Official Noctigarde updates can be sent to the status channel.';

    match = /^Paie RP mise a jour : (.+)\.$/.exec(normalizedValue);
    if (match) return `Salary settings updated: ${match[1]}.`;

    match = /^Bureau d'accueil Noctigarde publie dans #(.+)\.$/.exec(normalizedValue);
    if (match) return `Noctigarde welcome desk published in #${match[1]}.`;

    match = /^❌ Couleur invalide\. Utilise (.+)$/.exec(normalizedValue);
    if (match) return `❌ Invalid color. Use ${match[1]}`;

    return value;
  }

  function preserveWhitespace(original, translated) {
    const leading = original.match(/^\s*/)?.[0] || '';
    const trailing = original.match(/\s*$/)?.[0] || '';
    return `${leading}${translated}${trailing}`;
  }

  function shouldSkip(node) {
    const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    if (!element) return true;
    return Boolean(element.closest('script, style, .language-switch, [data-i18n-ignore]'));
  }

  function translateTextNodes(language) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      if (!shouldSkip(node)) {
        if (!textOriginals.has(node)) {
          textOriginals.set(node, node.nodeValue);
        }

        const original = textOriginals.get(node);
        const trimmed = original.trim();

        if (trimmed) {
          node.nodeValue = language === 'fr'
            ? original
            : preserveWhitespace(original, translateValue(trimmed, language));
        }
      }

      node = walker.nextNode();
    }
  }

  function translateAttributes(language) {
    const attrs = ['placeholder', 'aria-label', 'alt', 'title', 'content', 'data-tooltip'];
    document.querySelectorAll('[placeholder], [aria-label], [alt], [title], meta[content], [data-tooltip]').forEach((element) => {
      if (shouldSkip(element)) return;
      attrs.forEach((attr) => {
        if (!element.hasAttribute(attr)) return;
        const key = `i18nOriginal${attr.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}`;

        if (!element.dataset[key]) {
          element.dataset[key] = element.getAttribute(attr) || '';
        }

        const original = element.dataset[key];
        element.setAttribute(attr, language === 'fr' ? original : translateValue(original, language));
      });
    });
  }

  function renderLanguageSwitch(language) {
    let switcher = document.querySelector('.language-switch');
    const host = document.querySelector('.header-actions') || document.querySelector('.not-found');

    if (!host) return;

    if (!switcher) {
      switcher = document.createElement('div');
      switcher.className = 'language-switch';
      switcher.setAttribute('aria-label', 'Language');
      switcher.innerHTML = `
        <button type="button" data-lang-choice="fr">FR</button>
        <button type="button" data-lang-choice="en">EN</button>
      `;
      host.prepend(switcher);
      switcher.addEventListener('click', (event) => {
        const button = event.target.closest('[data-lang-choice]');
        if (!button) return;
        setLanguage(button.dataset.langChoice);
      });
    }

    switcher.querySelectorAll('[data-lang-choice]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.langChoice === language);
      button.setAttribute('aria-pressed', String(button.dataset.langChoice === language));
    });
  }

  function applyLanguage(language) {
    if (isTranslating) return;
    isTranslating = true;

    document.documentElement.lang = language;
    document.title = language === 'fr' ? titleOriginal : translateValue(titleOriginal, language);
    renderLanguageSwitch(language);
    translateAttributes(language);
    translateTextNodes(language);

    isTranslating = false;
  }

  function setLanguage(language) {
    localStorage.setItem(STORAGE_KEY, language);
    applyLanguage(language);
    window.dispatchEvent(new CustomEvent('sentinel:site-language-change', {
      detail: { language }
    }));
  }

  let scheduled = false;
  function scheduleTranslation() {
    if (scheduled || isTranslating) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyLanguage(currentLanguage());
    });
  }

  window.NoctigardeI18n = {
    apply: () => applyLanguage(currentLanguage()),
    setLanguage,
    translate: (value) => translateValue(value, currentLanguage())
  };

  applyLanguage(currentLanguage());

  const observer = new MutationObserver(scheduleTranslation);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
