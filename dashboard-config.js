'use strict';

(() => {
const SERVER_PRESETS = [
  {
    id: 'standard',
    eyebrow: 'Base',
    title: 'Standard',
    summary: 'Une configuration simple pour démarrer Noctigarde sans spécialiser le serveur.',
    advice: [
      'Choisis un rôle de service uniquement si ton serveur suit des heures.',
      'Garde un salon de logs lisible pour retrouver les actions importantes.',
      'Ajoute seulement les rôles staff qui doivent vraiment gérer Noctigarde.'
    ]
  },
  {
    id: 'rp-modern',
    eyebrow: 'RP moderne',
    title: 'Police / EMS / Staff RP',
    summary: 'Pensé pour les serveurs GTA, RP moderne ou équipes avec prises de service régulières.',
    advice: [
      'Utilise un rôle de service clair, par exemple En service ou Agent actif.',
      'Publie le panneau de service dans un salon visible par les agents.',
      'Garde les tickets pour support, signalement, recrutement et plaintes RP.'
    ]
  },
  {
    id: 'western',
    eyebrow: 'RP western',
    title: 'Époque 1900 / Western',
    summary: 'Adapté aux serveurs Red Dead ou RP plus immersifs, avec un vocabulaire plus sobre.',
    advice: [
      'Prévois des tickets pour plaintes, recrutements, demandes RP et signalements.',
      'Utilise le registre des salaires si les heures servent à rémunérer les métiers ou services.',
      'Le thème western du site peut être activé séparément selon la préférence de chacun.'
    ]
  },
  {
    id: 'staff',
    eyebrow: 'Équipe',
    title: 'Staff et modération',
    summary: 'Pour un serveur qui veut surtout encadrer les sanctions, les logs et les demandes membres.',
    advice: [
      'Configure les rôles autorisés avant de donner l’accès au dashboard.',
      'Vérifie que Noctigarde peut bannir, timeout, expulser et purger.',
      'Utilise les tickets pour centraliser les demandes et les signalements.'
    ]
  },
  {
    id: 'community',
    eyebrow: 'Communauté',
    title: 'Communauté Discord',
    summary: 'Pour un serveur généraliste qui veut rester simple, clair et facile à administrer.',
    advice: [
      'Commence avec les logs, les rôles staff et les tickets de support.',
      'Active l’auto-rôle seulement si tu as un rôle d’arrivée utile.',
      'Garde la modération par ID pour pouvoir agir même si une personne quitte le serveur.'
    ]
  }
];

const DIAGNOSTIC_LABELS = {
  ban: 'Noctigarde peut bannir',
  timeout: 'Noctigarde peut timeout',
  kick: 'Noctigarde peut expulser',
  purge: 'Noctigarde peut purger',
  manageChannels: 'Noctigarde peut créer des salons',
  attachFiles: 'Noctigarde peut joindre des fichiers',
  manageRoles: 'Noctigarde peut gérer les rôles',
  autoRole: 'Rôle automatique d’arrivée',
  serviceRole: 'Rôle de service configuré',
  roleOrder: 'Rôle Noctigarde trop bas',
  autoRoleOrder: 'Auto-rôle trop haut',
  logs: 'Salon de logs accessible'
};

const DIAGNOSTIC_FIXES = {
  ban: 'Ajoute la permission “Bannir des membres” au rôle Noctigarde.',
  timeout: 'Ajoute la permission “Modérer les membres” au rôle Noctigarde.',
  kick: 'Ajoute la permission “Expulser des membres” au rôle Noctigarde.',
  purge: 'Ajoute la permission “Gérer les messages” au rôle Noctigarde.',
  manageChannels: 'Ajoute la permission “Gérer les salons” au rôle Noctigarde.',
  attachFiles: 'Ajoute la permission “Joindre des fichiers” au rôle Noctigarde pour les comptes rendus.',
  manageRoles: 'Ajoute la permission “Gérer les rôles” au rôle Noctigarde.',
  autoRole: 'Choisis un rôle automatique valide, ou désactive cette option.',
  serviceRole: 'Choisis le rôle de service dans l’assistant de configuration.',
  roleOrder: 'Place le rôle Noctigarde au-dessus du rôle de service dans les paramètres Discord.',
  autoRoleOrder: 'Place le rôle Noctigarde au-dessus du rôle automatique d’arrivée dans les paramètres Discord.',
  logs: 'Autorise Noctigarde à voir et écrire dans le salon de logs.'
};

const DIAGNOSTIC_TAB_TARGETS = {
  ban: 'moderation',
  timeout: 'moderation',
  kick: 'moderation',
  purge: 'moderation',
  manageChannels: 'dossiers',
  attachFiles: 'dossiers',
  manageRoles: 'configuration',
  autoRole: 'moderation',
  serviceRole: 'setup',
  roleOrder: 'configuration',
  autoRoleOrder: 'moderation',
  logs: 'setup'
};

const DIAGNOSTIC_AREAS = {
  ban: 'Permissions',
  timeout: 'Permissions',
  kick: 'Permissions',
  purge: 'Permissions',
  manageChannels: 'Tickets',
  attachFiles: 'Tickets',
  manageRoles: 'Configuration',
  autoRole: 'Modération',
  serviceRole: 'Service',
  roleOrder: 'Configuration',
  autoRoleOrder: 'Modération',
  logs: 'Configuration'
};

const AUDIT_ACTION_LABELS = {
  'set-language': 'Langue',
  'set-server-preset': 'Profil serveur',
  'set-service-role': 'Rôle de service',
  'set-auto-role': 'Rôle automatique',
  'disable-auto-role': 'Rôle automatique',
  'set-log-channel': 'Salon de logs',
  'set-status-channel': 'Salon statut',
  'disable-status-channel': 'Salon statut',
  'set-updates-channel': 'Salon des nouveautés',
  'test-status-updates': 'Test des nouveautés',
  'set-updates-role': 'Mention des nouveautés',
  'clear-updates-role': 'Mention des nouveautés',
  'set-status-updates': 'Nouveautés statut',
  'enable-status-updates': 'Nouveautés statut',
  'disable-status-updates': 'Nouveautés statut',
  'publish-service-panel': 'Bureau de service',
  'set-payroll-settings': 'Réglage des salaires',
  'set-payroll-role-rate': 'Salaire par rôle',
  'remove-payroll-role-rate': 'Salaire de rôle retiré',
  'add-payroll-adjustment': 'Ajustement de salaire',
  'mark-payroll-status': 'Statut du salaire',
  'archive-payroll': 'Archive des salaires',
  'toggle-payroll-paid': 'Salaire',
  'publish-dossier-panel': 'Bureau d’accueil',
  'configure-dossier-roles': 'Rôles dossiers',
  'dossier-close': 'Dossier clôturé',
  'dossier-status': 'Statut dossier',
  'dossier-priority': 'Priorité dossier',
  'dossier-claim': 'Dossier pris en charge',
  'dossier-reopen': 'Dossier réouvert',
  'repair-dossier-panels': 'Bureaux vérifiés',
  'add-dossier-type-role': 'Responsable par dossier',
  'remove-dossier-type-role': 'Responsable retiré',
  'set-dossier-category': 'Catégorie dossier',
  'set-dossier-questions': 'Formulaire dossier',
  'set-dossier-sla': 'Délais dossier',
  'create-dossier-template': 'Réponse préparée créée',
  'delete-dossier-template': 'Réponse préparée retirée',
  'send-dossier-template': 'Réponse préparée envoyée',
  'add-dossier-role': 'Rôle ticket ajouté',
  'remove-dossier-role': 'Rôle ticket retiré',
  'dossier-add': 'Intervenant ajouté',
  'dossier-remove': 'Intervenant retiré',
  'dossier-transcript': 'Compte rendu dossier',
  'add-command-role': 'Rôle autorisé ajouté',
  'remove-command-role': 'Rôle autorisé retiré',
  'set-automod-settings': 'Garde réglée',
  'add-automod-word': 'Mot surveillé ajouté',
  'remove-automod-word': 'Mot surveillé retiré',
  'set-warning-escalation': 'Paliers d’avertissements',
  'notification-state': 'Notification mise à jour',
  'save-scheduled-announcement': 'Annonce programmée',
  'approve-scheduled-announcement': 'Annonce validée',
  'cancel-scheduled-announcement': 'Annonce annulée',
  'save-report-schedule': 'Rapport automatique',
  'remove-report-schedule': 'Rapport automatique retiré',
  'run-simulation': 'Essai sans effet',
  'run-validation': 'Validation Noctigarde',
  'toggle-service': 'Bouton service',
  'start-service': 'Prise de service',
  'end-service': 'Fin de service',
  'reset-user': 'Fiche réinitialisée',
  'reset-guild': 'Registre réinitialisé',
  'sync-service': 'Synchronisation',
  'custom-embed-create': 'Embed créé',
  'custom-embed-edit': 'Embed modifié',
  'custom-embed-delete': 'Embed supprimé',
  warn: 'Avertissement',
  timeout: 'Mise au silence',
  untimeout: 'Silence levé',
  kick: 'Expulsion',
  ban: 'Bannissement',
  tempban: 'Bannissement temporaire',
  unban: 'Bannissement levé',
  clear: 'Purge',
  purge: 'Purge',
  lock: 'Salon verrouillé',
  unlock: 'Salon rouvert',
  slowmode: 'Salon ralenti',
  case_edit: 'Dossier corrigé',
  case_delete: 'Dossier retiré',
  'edit-case': 'Dossier corrigé',
  'delete-case': 'Dossier retiré',
  unwarn: 'Avertissement retiré'
};

const AUTOMOD_ACTION_LABELS = {
  log: 'Log seulement',
  delete: 'Supprimer',
  warn: 'Avertir',
  timeout: 'Timeout',
  kick: 'Expulser',
  ban: 'Bannir'
};

const AUTOMOD_RULE_LABELS = {
  forbidden_words: 'Mots interdits',
  discord_invite: 'Invitations Discord',
  spam: 'Spam',
  premium_caps: 'Majuscules',
  premium_mentions: 'Mentions',
  premium_raid: 'Anti-raid'
};

const DASHBOARD_TABS = [
  {
    id: 'overview',
    label: 'Accueil',
    eyebrow: 'Synthèse',
    title: 'Accueil serveur',
    description: 'État, alertes et actions récentes'
  },
  {
    id: 'setup',
    label: 'Premiers pas',
    eyebrow: 'Guide',
    title: 'Configuration guidée',
    description: 'Installer dans le bon ordre'
  },
  {
    id: 'configuration',
    label: 'Configuration',
    eyebrow: 'Base',
    title: 'Configuration',
    description: 'Langue, rôles et logs'
  },
  {
    id: 'service',
    label: 'Service & salaires',
    eyebrow: 'Heures',
    title: 'Service et salaires',
    description: 'Présences, barèmes et versements'
  },
  {
    id: 'dossiers',
    label: 'Tickets',
    eyebrow: 'Support',
    title: 'Tickets et dossiers',
    description: 'Demandes privées et suivi staff'
  },
  {
    id: 'moderation',
    label: 'Modération',
    eyebrow: 'Sécurité',
    title: 'Modération',
    description: 'Sanctions, auto-rôle et permissions'
  },
  {
    id: 'embeds',
    label: 'Annonces',
    eyebrow: 'Messages',
    title: 'Annonces',
    description: 'Messages propres sous Noctigarde'
  },
  {
    id: 'audit',
    label: 'Historique',
    eyebrow: 'Traces',
    title: 'Historique',
    description: 'Retrouver qui a fait quoi'
  },
  {
    id: 'operations',
    label: 'Pilotage',
    eyebrow: 'Suivi',
    title: 'Pilotage et rapports',
    description: 'Alertes, exports, essais et contrôles'
  },
  {
    id: 'community',
    label: 'Équipe & communauté',
    eyebrow: 'Organisation',
    title: 'Équipe et communauté',
    description: 'Recrutements, planning, idées et statistiques'
  },
  {
    id: 'founder',
    label: 'Accès au site',
    eyebrow: 'Régie',
    title: 'Accès au site',
    description: 'Fonda, staff et maintenance'
  }
];

const DASHBOARD_SUBTABS = {
  overview: [
    { id: 'summary', label: 'Synthèse', description: 'État du jour et notifications', selectors: ['.today-grid', '.notification-center'] },
    { id: 'path', label: 'Parcours', description: 'Étapes et outils disponibles', selectors: ['.dashboard-path', '.plan-scope-grid'] },
    { id: 'details', label: 'Détails', description: 'Configuration, alertes et actions', selectors: ['.server-home-grid'] }
  ],
  setup: [
    { id: 'base', label: 'Base', description: 'Langue et rôle de service', selectors: ['.setup-steps > .setup-step:nth-child(1)', '.setup-steps > .setup-step:nth-child(2)'] },
    { id: 'channels', label: 'Salons et accès', description: 'Logs, staff et nouveautés', selectors: ['.setup-steps > .setup-step:nth-child(3)', '.setup-steps > .setup-step:nth-child(4)', '.setup-steps > .setup-step:nth-child(5)'] },
    { id: 'profile', label: 'Profil', description: 'Conseils adaptés au serveur', selectors: ['.server-preset-panel', '.setup-footer'] }
  ],
  configuration: [
    { id: 'general', label: 'Général', description: 'Réglages et panneaux Discord', selectors: ['.config-hub-grid'] },
    { id: 'updates', label: 'Nouveautés', description: 'Livraison des annonces officielles', selectors: ['.official-update-history'] },
    { id: 'access', label: 'Accès et réparation', description: 'Rôles staff et références Discord', selectors: ['.staff-permissions-panel', '.repair-center-panel'] },
    { id: 'privacy', label: 'Données', description: 'Conservation, export et suppression', selectors: ['.privacy-center-panel'] }
  ],
  service: [
    { id: 'attendance', label: 'Présences', description: 'Agents actifs et registres', selectors: ['.service-overview-panel'] },
    { id: 'payroll', label: 'Salaires', description: 'Semaine, versements et archives', selectors: ['.payroll-panel'] },
    { id: 'actions', label: 'Actions', description: 'Ouverture, clôture et synchronisation', selectors: ['.service-actions-panel', '.inline-premium-panel'] }
  ],
  dossiers: [
    { id: 'desk', label: 'Bureau', description: 'Publication et état des panneaux', selectors: ['.dossier-permission-alert', '.dossier-quota-alert', '[data-action-form="publish-dossier-panel"]', '.dossier-repair-form'] },
    { id: 'access', label: 'Confidentialité', description: 'Responsables et accès par catégorie', selectors: ['.dossier-explain-card', '.dossier-type-roles'] },
    { id: 'workflow', label: 'Traitement', description: 'Formulaires, réponses et délais', selectors: ['.dossier-premium-settings', '.dossier-templates-panel', '.dossier-stats-panel'] },
    { id: 'registry', label: 'Registre', description: 'File d’attente et historique', selectors: ['.dossier-list-card'] }
  ],
  moderation: [
    { id: 'automod', label: 'Protection', description: 'Permissions, arrivée et garde automatique', selectors: ['.diagnostics-panel', '.moderation-note', '.automod-card'] },
    { id: 'sanctions', label: 'Sanctions', description: 'Mesures et registre disciplinaire', selectors: ['[data-action-form="warn"]', '[data-action-form="timeout"]', '[data-action-form="untimeout"]', '[data-action-form="kick"]', '[data-action-form="ban"]', '[data-action-form="tempban"]', '[data-action-form="unban"]', '[data-action-form="edit-case"]', '[data-action-form="delete-case"]', '[data-action-form="unwarn"]', '.moderation-cases-note'] },
    { id: 'channels', label: 'Salons', description: 'Nettoyage, verrouillage et archives', selectors: ['[data-action-form="purge"]', '[data-action-form="lock"]', '[data-action-form="unlock"]', '[data-action-form="slowmode"]', '.purge-archive-history'] },
    { id: 'critical', label: 'Actions critiques', description: 'Remise à zéro et validations', selectors: ['[data-action-form="reset-guild"]', '#moderation-tools > .maintenance-file-list'] }
  ],
  embeds: [
    { id: 'create', label: 'Créer', description: 'Nouvelle annonce Noctigarde', selectors: ['[data-action-form="custom-embed-create"]'] },
    { id: 'edit', label: 'Modifier', description: 'Texte, couleur et médias', selectors: ['[data-action-form="custom-embed-edit"]'] },
    { id: 'manage', label: 'Gérer', description: 'Liste et suppression', selectors: ['[data-action-form="custom-embed-delete"]', '.announcements-panel .inline-form'] }
  ],
  audit: [
    { id: 'journal', label: 'Journal', description: 'Filtres et actions enregistrées', selectors: ['.audit-overview', '[data-audit-filter]', '.audit-scope-note', '.audit-table-shell'] },
    { id: 'member', label: 'Recherche membre', description: 'Historique consolidé par ID', selectors: ['.global-lookup-panel'] }
  ],
  operations: [
    { id: 'alerts', label: 'Notifications', description: 'Points qui demandent une action', selectors: ['.operations-panel > .notification-center'] },
    { id: 'reports', label: 'Rapports', description: 'Exports et envois automatiques', selectors: ['[data-operation-section="reports"]'] },
    { id: 'announcements', label: 'Programmation', description: 'Brouillons et annonces planifiées', selectors: ['[data-operation-section="announcements"]'] },
    { id: 'testing', label: 'Essais', description: 'Simulations et validation Noctigarde', selectors: ['[data-operation-section="testing"]'] }
  ],
  community: [
    { id: 'recruitment', label: 'Recrutements', description: 'Formulaires et décisions', selectors: ['.community-recruitment'] },
    { id: 'planning', label: 'Planning', description: 'Créneaux, réponses et absences', selectors: ['.community-planning'] },
    { id: 'suggestions', label: 'Suggestions', description: 'Idées, votes et publication', selectors: ['.community-suggestions'] },
    { id: 'panels', label: 'Panneaux', description: 'Identité des messages Discord', selectors: ['.community-panels'] },
    { id: 'analytics', label: 'Statistiques', description: 'Activité et charge des équipes', selectors: ['.community-analytics'] },
    { id: 'help', label: 'Aide', description: 'Recherche adaptée au serveur', selectors: ['.community-help'] }
  ],
  founder: [
    { id: 'servers', label: 'Serveurs', description: 'Parc équipé de Noctigarde', selectors: ['[aria-label="Serveurs Noctigarde"]'] },
    { id: 'security', label: 'Sécurité', description: 'Double protection et validations', selectors: ['[aria-label="Double sécurité fondatrice"]', '[aria-label="Validations critiques"]'] },
    { id: 'publishing', label: 'Publication', description: 'Annonce globale protégée', selectors: ['[aria-label="Annonce globale Noctigarde"]'] },
    { id: 'health', label: 'Surveillance', description: 'Incidents, tâches et préproduction', selectors: ['[aria-label="Surveillance Noctigarde"]', '[aria-label="Préproduction Discord"]'] },
    { id: 'storage', label: 'Données', description: 'Confidentialité, stockage et sauvegardes', selectors: ['[aria-label="Demandes de confidentialité"]', '[aria-label="Centre de maintenance Noctigarde"]', '[aria-label="Stockage Noctigarde"]'] },
    { id: 'staff', label: 'Équipe', description: 'Accès de la régie', selectors: ['[aria-label="Accès staff Noctigarde"]'] }
  ]
};

window.NoctigardeDashboardConfig = Object.freeze({
    SERVER_PRESETS,
    DIAGNOSTIC_LABELS,
    DIAGNOSTIC_FIXES,
    DIAGNOSTIC_TAB_TARGETS,
    DIAGNOSTIC_AREAS,
    AUDIT_ACTION_LABELS,
    AUTOMOD_ACTION_LABELS,
    AUTOMOD_RULE_LABELS,
    DASHBOARD_TABS,
    DASHBOARD_SUBTABS
});
})();
