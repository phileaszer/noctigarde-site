'use strict';

(() => {
function dashboardErrorMessage(input, currentState) {
  const language = document.documentElement.lang === 'en' ? 'en' : 'fr';
  const payload = input && typeof input === 'object' ? input.payload || null : null;
  const message = typeof input === 'string' ? input : input?.message;
  const payloadFix = typeof payload?.fix === 'string' && payload.fix.trim()
    ? payload.fix.trim()
    : null;

  if (language === 'en') {
    const firstFix = currentState?.diagnostics?.fixes?.[0] || null;

    const translated = {
      'Login required.': 'Log in with Discord to use the dashboard.',
      'Noctigarde is not installed on this server.': 'Invite Noctigarde to this server before using the dashboard.',
      'You do not have access to this server dashboard.': 'You do not have access to this server dashboard.',
      'You do not have permission to manage Noctigarde on this server.': 'You do not have an allowed role to manage Noctigarde on this server.',
      'You do not have permission to manage Noctigarde dossiers on this server.': 'You do not have a responsible role to manage Noctigarde tickets on this server.',
      'You do not have permission for this moderation action.': 'Your Discord role cannot perform this moderation action.',
      'Noctigarde does not have the required Discord permission.': 'Noctigarde does not have the required Discord permission.',
      'Founder access is required.': 'Only the founder can use this command.',
      'Site staff access is required.': 'This panel is reserved for the founder and site staff.',
      'Invalid site staff action.': 'Invalid site staff action.',
      'Founder access cannot be managed as staff.': 'The founder account already has full access.',
      'Recent Discord login is required.': 'Reconnect with Discord before changing protected access.',
      'Discord session verification failed.': 'Your Discord session must be verified again.',
      'Discord user not found.': 'This Discord account could not be found.',
      'Bot accounts cannot receive site staff access.': 'A bot account cannot receive site staff access.',
      'Site staff must be a member of this Discord server to perform actions.': 'Join this Discord server before performing an action.',
      'A Noctigarde Discord staff role is required for site staff access.': 'A staff role on the Noctigarde Discord server is also required.',
      'The Noctigarde Discord server is unavailable.': 'The Noctigarde Discord server is unavailable.',
      'No Noctigarde Discord staff role is configured.': 'No staff role is configured on the Noctigarde Discord server.',
      'The user must join the Noctigarde Discord server before receiving site staff access.': 'This person must join the Noctigarde Discord server first.',
      'The user must have a Noctigarde Discord staff role before receiving site staff access.': 'Give this person a staff role on the Noctigarde Discord server first.',
      'Invalid Discord user ID.': 'The Discord ID is not valid.',
      'Text channel not found.': 'Text channel not found.',
      'Role not found.': 'Discord role not found.',
      'Invalid timeout duration.': 'Invalid timeout duration. Example: 10m, 2h, 7d.',
      'Invalid temporary ban duration.': 'Invalid temporary ban duration.',
      'Invalid slowmode duration.': 'Invalid slowmode duration.',
      'Invalid hourly rate.': 'Invalid hourly rate.',
      'Invalid payroll adjustment.': 'Invalid payroll adjustment.',
      'Invalid payroll week.': 'The payroll week is invalid.',
      'Invalid payroll status.': 'The payroll status is invalid.',
      'Payroll line not found.': 'This payroll line no longer exists.',
      'Invalid message ID.': 'Invalid message ID.',
      'No service role is configured.': 'No duty role is configured.',
      'This user must be in the server to start duty.': 'This person must be in the server to start duty from the dashboard.',
      'This user is already on duty.': 'This person is already on duty.',
      'This user is not on duty.': 'This person is not on duty.',
      'Invalid server profile.': 'Invalid server profile.',
      'Case not found.': 'No case was found with this ID.',
      'Missing dossier type.': 'Ticket type is missing.',
      'Category not found.': 'Discord category not found.',
      'Noctigarde cannot send this embed in the selected channel.': 'Noctigarde cannot send this embed in the selected channel.',
      'Noctigarde cannot use the selected channel.': 'Noctigarde cannot use the selected channel.',
      'Invalid local image. Use a PNG, JPG, WebP, or GIF image.': 'Invalid local image.',
      'Local image too large. Keep the total under 8 MB per embed.': 'Local image too large.',
      'Payload too large.': 'Uploaded image is too large.',
      'Discord refused the action.': 'Discord refused the action.',
      'Discord ban not found.': 'No Discord ban was found for this ID.',
      'No embed field provided.': 'Choose at least one embed field to update.',
      'Noctigarde embed not found.': 'No Noctigarde embed was found with this ID in the selected channel.',
      'Unknown moderation action.': 'Unknown moderation action.',
      'Automod word is invalid.': 'Enter a forbidden word with at least 2 characters.',
      'This channel is not a Noctigarde dossier.': 'This channel is not a Noctigarde ticket.'
    };

    const resolutionByMessage = {
      'You do not have permission for this moderation action.': 'Check that your Discord role has the right permission, or add your role to Noctigarde allowed roles.',
      'Noctigarde does not have the required Discord permission.': firstFix || 'Open the permissions diagnostic and fix the permission shown there.',
      'Invalid Discord user ID.': 'Copy the full numeric Discord ID, not the username.',
      'Text channel not found.': 'Choose a text channel that Noctigarde can access.',
      'Role not found.': 'Choose a Discord role that still exists on the server.',
      'No service role is configured.': 'Open the assistant and choose the role given to members on duty.',
      'This user must be in the server to start duty.': 'Check the Discord ID and make sure this person is still in the server.',
      'This user is already on duty.': 'Use “End duty” if you want to stop the current session.',
      'This user is not on duty.': 'No active duty session was found for this ID on this server.',
      'Invalid server profile.': 'Choose one of the profiles shown in the assistant.',
      'Invalid hourly rate.': 'Enter a positive hourly amount, for example 500 or 1250.',
      'Invalid payroll adjustment.': 'Enter a Discord ID, a type, a positive amount, and a short reason.',
      'Invalid payroll week.': 'Open the archive again and retry from its own payment line.',
      'Invalid payroll status.': 'Refresh the dashboard and use the button on the payroll line.',
      'Payroll line not found.': 'Refresh the dashboard and choose an existing current or archived payroll line.',
      'Invalid message ID.': 'Copy the full numeric ID of the message sent by Noctigarde.',
      'Case not found.': 'Check the case ID in the latest cases table.',
      'Category not found.': 'Choose a Discord category that still exists.',
      'Noctigarde cannot send this embed in the selected channel.': firstFix || 'Allow Noctigarde to view the channel and send messages there.',
      'Noctigarde cannot use the selected channel.': 'Fix the permissions of the selected channel, then try again.',
      'Invalid local image. Use a PNG, JPG, WebP, or GIF image.': 'Choose a valid PNG, JPG, WebP, or GIF image.',
      'Local image too large. Keep the total under 8 MB per embed.': 'Use a lighter image, up to 8 MB total per embed.',
      'Payload too large.': 'Use a lighter image, up to 8 MB total per embed.',
      'Discord refused the action.': 'Open the permissions diagnostic, fix the red item, then try again.',
      'Discord ban not found.': 'Check the full Discord ID and make sure this user is still banned.',
      'No embed field provided.': 'Change at least the title, description, color, image, thumbnail, or footer.',
      'Noctigarde embed not found.': 'Choose the channel where the embed is posted, then paste the message ID. If the Discord message was deleted, its slot will be freed.',
      'This channel is not a Noctigarde dossier.': 'Choose an open Noctigarde ticket channel.',
      'Founder access is required.': 'Only the founder can change this access.',
      'Site staff access is required.': 'Ask the founder to add your Discord account as site staff.',
      'Invalid site staff action.': 'Choose add or remove.',
      'Founder access cannot be managed as staff.': 'The founder account already has full access.',
      'Recent Discord login is required.': 'Reconnect with Discord, then retry the protected action.',
      'Discord session verification failed.': 'Reconnect with Discord to verify your identity.',
      'A Noctigarde Discord staff role is required for site staff access.': 'Ask the founder to assign you a staff role on the Noctigarde Discord server.'
    };
    const base = translated[message] || message || 'Action failed.';
    const resolution = payloadFix || resolutionByMessage[message];

    return resolution ? `${base}\nFix: ${resolution}` : base;
  }

  const translated = {
    'Login required.': 'Connecte-toi avec Discord pour utiliser le dashboard.',
    'Noctigarde is not installed on this server.': 'Noctigarde doit être invité comme bot sur ce serveur avant d’utiliser le dashboard.',
    'You do not have access to this server dashboard.': 'Tu n’as pas accès au dashboard de ce serveur.',
    'You do not have permission to manage Noctigarde on this server.': 'Tu n’as pas de rôle autorisé pour gérer Noctigarde sur ce serveur.',
    'You do not have permission to manage Noctigarde dossiers on this server.': 'Tu n’as pas de rôle responsable pour gérer les tickets Noctigarde sur ce serveur.',
    'You do not have permission for this moderation action.': 'Tu n’as pas la permission Discord nécessaire pour cette sanction.',
    'Noctigarde does not have the required Discord permission.': 'Noctigarde n’a pas la permission Discord nécessaire pour faire cette action.',
    'Founder access is required.': 'Seul le fondateur peut faire cette action.',
    'Site staff access is required.': 'Ce panneau est réservé au fondateur et au staff site.',
    'Invalid site staff action.': 'Action staff site invalide.',
    'Founder access cannot be managed as staff.': 'Le compte fondateur possède déjà l’accès complet.',
    'Recent Discord login is required.': 'Une reconnexion Discord récente est nécessaire.',
    'Discord session verification failed.': 'Ta session Discord doit être vérifiée à nouveau.',
    'Discord user not found.': 'Ce compte Discord est introuvable.',
    'Bot accounts cannot receive site staff access.': 'Un compte bot ne peut pas recevoir le grade staff du site.',
    'Site staff must be a member of this Discord server to perform actions.': 'Tu dois être membre de ce serveur Discord pour y effectuer une action.',
    'A Noctigarde Discord staff role is required for site staff access.': 'Un rôle staff sur le Discord Noctigarde est aussi obligatoire.',
    'The Noctigarde Discord server is unavailable.': 'Le serveur Discord Noctigarde est temporairement indisponible.',
    'No Noctigarde Discord staff role is configured.': 'Aucun rôle staff n’est configuré sur le Discord Noctigarde.',
    'The user must join the Noctigarde Discord server before receiving site staff access.': 'Cette personne doit d’abord rejoindre le Discord Noctigarde.',
    'The user must have a Noctigarde Discord staff role before receiving site staff access.': 'Donne d’abord un rôle staff à cette personne sur le Discord Noctigarde.',
    'Invalid Discord user ID.': 'L’ID Discord indiqué n’est pas valide.',
    'Text channel not found.': 'Salon textuel introuvable.',
    'Role not found.': 'Rôle Discord introuvable.',
    'Invalid timeout duration.': 'Durée de timeout invalide. Exemple : 10m, 2h, 7d.',
    'Invalid temporary ban duration.': 'Durée de ban temporaire invalide.',
    'Invalid slowmode duration.': 'Durée de mode lent invalide.',
    'Invalid hourly rate.': 'Montant horaire invalide.',
    'Invalid payroll adjustment.': 'Ajustement de salaire invalide.',
    'Invalid payroll week.': 'La semaine de salaire indiquée est invalide.',
    'Invalid payroll status.': 'L’état du salaire indiqué est invalide.',
    'Payroll line not found.': 'Cette ligne de salaire n’existe plus.',
    'Invalid message ID.': 'ID de message invalide.',
    'No service role is configured.': 'Aucun rôle de service n’est configuré.',
    'This user must be in the server to start duty.': 'Cette personne doit être présente sur le serveur pour prendre son service depuis le dashboard.',
    'This user is already on duty.': 'Cette personne est déjà en service.',
    'This user is not on duty.': 'Cette personne n’est pas en service.',
    'Invalid server profile.': 'Profil serveur invalide.',
    'Case not found.': 'Aucun cas trouvé avec cet ID.',
    'Missing dossier type.': 'Type de dossier manquant.',
    'Category not found.': 'Catégorie Discord introuvable.',
    'Noctigarde cannot send this embed in the selected channel.': 'Noctigarde ne peut pas envoyer cet embed dans le salon choisi.',
    'Noctigarde cannot use the selected channel.': 'Noctigarde ne peut pas utiliser le salon choisi.',
    'Invalid local image. Use a PNG, JPG, WebP, or GIF image.': 'Image locale invalide.',
    'Local image too large. Keep the total under 8 MB per embed.': 'Image locale trop lourde.',
    'Payload too large.': 'Image envoyée trop lourde.',
    'Discord refused the action.': 'Discord a refusé l’action.',
    'Discord ban not found.': 'Aucun bannissement Discord n’a été trouvé pour cet ID.',
    'No embed field provided.': 'Indique au moins un champ à modifier.',
    'Noctigarde embed not found.': 'Aucun embed Noctigarde n’a été trouvé avec cet ID dans le salon choisi.',
    'Unknown moderation action.': 'Action de modération inconnue.',
    'Automod word is invalid.': 'Indique un mot interdit d’au moins 2 caractères.',
    'This channel is not a Noctigarde dossier.': 'Ce salon n’est pas un dossier Noctigarde.'
  };

  const base = translated[message] || message || 'Action impossible pour le moment.';
  const diagnostics = currentState?.diagnostics;
  const firstFix = diagnostics?.fixes?.[0] || null;
  const resolutionByMessage = {
    'You do not have permission for this moderation action.': 'Vérifie que ton rôle Discord a la permission nécessaire, ou ajoute ton rôle dans les rôles autorisés Noctigarde.',
    'Noctigarde does not have the required Discord permission.': firstFix || 'Ouvre le diagnostic permissions du dashboard et corrige la permission indiquée.',
    'Invalid Discord user ID.': 'Copie l’ID Discord numérique complet de la personne, pas son pseudo.',
    'Text channel not found.': 'Choisis un salon textuel accessible par Noctigarde.',
    'Role not found.': 'Choisis un rôle Discord toujours présent sur le serveur.',
    'No service role is configured.': 'Va dans l’assistant et choisis le rôle donné aux membres en service.',
    'This user must be in the server to start duty.': 'Vérifie l’ID Discord et assure-toi que la personne est encore sur ce serveur.',
    'This user is already on duty.': 'Utilise plutôt “Fin de poste” si tu veux arrêter sa session actuelle.',
    'This user is not on duty.': 'Aucune session active n’est trouvée pour cet ID sur ce serveur.',
    'Invalid server profile.': 'Choisis un profil proposé dans l’assistant.',
    'Invalid hourly rate.': 'Indique un montant horaire positif, par exemple 500 ou 1250.',
    'Invalid payroll adjustment.': 'Indique un ID Discord, un type, un montant positif et une raison courte.',
    'Invalid payroll week.': 'Rouvre l’archive puis relance l’action depuis la ligne de salaire.',
    'Invalid payroll status.': 'Actualise le dashboard et utilise le bouton présent sur la ligne de salaire.',
    'Payroll line not found.': 'Actualise le dashboard et choisis une ligne de salaire actuelle ou archivée.',
    'Invalid message ID.': 'Copie l’ID numérique complet du message envoyé par Noctigarde.',
    'Case not found.': 'Vérifie l’ID du cas dans le tableau des derniers dossiers.',
    'Category not found.': 'Choisis une catégorie Discord encore présente sur le serveur.',
    'Noctigarde cannot send this embed in the selected channel.': firstFix || 'Autorise Noctigarde à voir le salon et à y envoyer des messages.',
    'Noctigarde cannot use the selected channel.': 'Corrige les permissions du salon choisi, puis réessaie.',
    'Invalid local image. Use a PNG, JPG, WebP, or GIF image.': 'Choisis une image PNG, JPG, WebP ou GIF valide.',
    'Local image too large. Keep the total under 8 MB per embed.': 'Utilise une image plus légère, 8 Mo maximum au total par embed.',
    'Payload too large.': 'Utilise une image plus légère, 8 Mo maximum au total par embed.',
    'Discord refused the action.': 'Ouvre le diagnostic permissions, corrige le point rouge, puis réessaie.',
    'Discord ban not found.': 'Vérifie l’ID Discord complet et assure-toi que cette personne est encore bannie.',
    'No embed field provided.': 'Modifie au moins le titre, la description, la couleur, l’image, la miniature ou le footer.',
    'Noctigarde embed not found.': 'Choisis le salon où se trouve l’embed, puis colle l’ID du message. Si le message a été supprimé sur Discord, son emplacement sera libéré.',
    'This channel is not a Noctigarde dossier.': 'Choisis un salon de ticket Noctigarde ouvert.',
    'Founder access is required.': 'Connecte-toi avec le compte Discord fondateur pour modifier cet accès.',
    'Site staff access is required.': 'Demande au fondateur d’ajouter ton compte Discord au staff site.',
    'Invalid site staff action.': 'Choisis ajouter ou retirer.',
    'Founder access cannot be managed as staff.': 'Le compte fondateur n’a pas besoin d’être ajouté comme staff.',
    'Recent Discord login is required.': 'Reconnecte-toi avec Discord puis relance l’action protégée.',
    'Discord session verification failed.': 'Reconnecte-toi avec Discord pour confirmer ton identité.',
    'A Noctigarde Discord staff role is required for site staff access.': 'Demande au fondateur de t’attribuer un rôle staff sur le Discord Noctigarde.'
  };
  const resolution = payloadFix || resolutionByMessage[message];

  return resolution ? `${base}\nÀ faire : ${resolution}` : base;
}


  window.NoctigardeDashboardErrorMessage = dashboardErrorMessage;
})();
