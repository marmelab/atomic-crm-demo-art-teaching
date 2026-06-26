import type { CrmMessages } from "./englishCrmMessages";

export const frenchCrmMessages = {
  resources: {
    contacts: {
      name: "Élève |||| Élèves",
      forcedCaseName: "Élève",
      field_categories: {
        background_info: "Informations complémentaires",
        identity: "Identité",
        misc: "Divers",
        personal_info: "Informations personnelles",
      },
      fields: {
        first_name: "Prénom",
        last_name: "Nom",
        last_seen: "Dernière activité",
        email_jsonb: "Adresses e-mail",
        email: "E-mail",
        phone_jsonb: "Numéros de téléphone",
        phone_number: "Numéro de téléphone",
        linkedin_url: "URL LinkedIn",
        background: "Informations de contexte",
        has_newsletter: "Abonné à la newsletter",
        sales_id: "Responsable de compte",
      },
      action: {
        add: "Ajouter un élève",
        add_first: "Ajoutez votre premier élève",
        create: "Créer un élève",
        edit: "Modifier l'élève",
        export_vcard: "Exporter en vCard",
        new: "Nouvel élève",
        show: "Afficher l'élève",
      },
      background: {
        last_activity_on: "Dernière activité le %{date}",
        added_on: "Ajouté le %{date}",
        followed_by: "Suivi par %{name}",
        followed_by_you: "Suivi par vous",
        status_none: "Aucun",
      },
      empty: {
        description: "Il semble que votre liste d'élèves soit vide.",
        title: "Aucun élève trouvé",
      },
      import: {
        title: "Importer des élèves",
        button: "Importer un fichier CSV",
        complete:
          "Import des élèves terminé. %{importCount} élèves importés, %{errorCount} erreurs",
        progress:
          "%{importCount} / %{rowCount} élèves importés, avec %{errorCount} erreurs.",
        error:
          "Échec de l'importation de ce fichier. Veuillez vous assurer que vous avez fourni un fichier CSV valide.",
        imported: "Importé",
        remaining_time: "Temps restant estimé :",
        running: "L'import est en cours, merci de ne pas fermer cet onglet.",
        sample_download: "Télécharger un exemple CSV",
        sample_hint:
          "Voici un exemple de fichier CSV que vous pouvez utiliser comme modèle",
        stop: "Arrêter l'importation",
        csv_file: "Fichier CSV",
        contacts_label: "élève |||| élèves",
      },
      inputs: {
        genders: {
          male: "Monsieur",
          female: "Madame",
          nonbinary: "Indéterminé",
        },
        personal_info_types: {
          work: "Pro",
          home: "Perso",
          other: "Autre",
        },
      },
      list: {
        error_loading: "Erreur lors du chargement des élèves",
      },
      bulk_tag: {
        action: "Étiqueter",
        back: "Retour aux étiquettes",
        create_description:
          "Créez une nouvelle étiquette et appliquez-la aux élèves sélectionnés.",
        description:
          "Choisissez une étiquette existante ou créez-en une pour les élèves sélectionnés.",
        empty:
          "Aucune étiquette pour le moment. Créez-en une pour étiqueter les élèves sélectionnés.",
        error: "Impossible d'ajouter l'étiquette aux élèves",
        noop: "Les élèves sélectionnés ont déjà cette étiquette",
        success:
          "Étiquette ajoutée à %{smart_count} élève |||| Étiquette ajoutée à %{smart_count} élèves",
        title: "Ajouter une étiquette aux élèves",
      },
      merge: {
        action: "Fusionner avec un autre élève",
        confirm: "Fusionner les élèves",
        current_contact: "Élève actuel (sera supprimé)",
        description: "Fusionnez cet élève avec un autre.",
        error: "Échec de la fusion des élèves",
        merging: "Fusion...",
        no_additional_data: "Aucune donnée supplémentaire à fusionner",
        select_target: "Veuillez sélectionner un élève avec lequel fusionner",
        success: "Élèves fusionnés avec succès",
        target_contact: "Élève cible (sera conservé)",
        title: "Fusionner les élèves",
        warning_description:
          "Toutes les données seront transférées au deuxième élève. Cette action ne peut pas être annulée.",
        warning_title: "Avertissement : opération destructrice",
        what_will_be_merged: "Ce qui sera fusionné :",
      },
      filters: {
        before_last_month: "Avant le mois dernier",
        before_this_month: "Avant ce mois-ci",
        before_this_week: "Avant cette semaine",
        managed_by_me: "Géré par moi",
        search: "Rechercher nom...",
        this_week: "Cette semaine",
        today: "Aujourd'hui",
        tags: "Étiquettes",
        tasks: "Tâches",
      },
      hot: {
        empty_change_status:
          'Changez le statut d\'un élève en ajoutant une note à cet élève et en cliquant sur "afficher les options".',
        empty_hint: 'Les élèves avec un statut "chaud" apparaîtront ici.',
        title: "Élèves actifs",
      },
    },
    notes: {
      name: "Note |||| Notes",
      forcedCaseName: "Note",
      fields: {
        status: "Statut",
        date: "Date",
        attachments: "Pièces jointes",
        contact_id: "Contact",
      },
      action: {
        add: "Ajouter une note",
        add_first: "Ajoutez votre première note",
        delete: "Supprimer la note",
        edit: "Modifier la note",
        update: "Mettre à jour la note",
        add_this: "Ajouter cette note",
      },
      sheet: {
        create: "Créer une note",
        create_for: "Créer une note pour %{name}",
        edit: "Modifier la note",
        edit_for: "Modifier la note pour %{name}",
      },
      deleted: "Note supprimée",
      empty: "Aucune note pour l'instant",
      author_added: "%{name} a ajouté une note",
      you_added: "Vous avez ajouté une note",
      me: "Moi",
      list: {
        error_loading: "Erreur lors du chargement des notes",
      },
      note_for_contact: "Note pour %{name}",
      stepper: {
        hint: "Accédez à une page de contact et ajoutez une note",
      },
      added: "Note ajoutée",
      inputs: {
        add_note: "Ajouter une note",
        options_hint: "(joindre des fichiers ou modifier les détails)",
        show_options: "Afficher les options",
      },
      actions: {
        attach_document: "Joindre un document",
      },
      validation: {
        note_or_attachment_required: "Une note ou une pièce jointe est requise",
      },
    },
    sales: {
      name: "Utilisateur |||| Utilisateurs",
      fields: {
        first_name: "Prénom",
        last_name: "Nom",
        email: "E-mail",
        administrator: "Admin",
        disabled: "Désactivé",
      },
      create: {
        error:
          "Une erreur s'est produite lors de la création de l'utilisateur.",
        success:
          "Utilisateur créé. Ils recevront prochainement un email pour définir leur mot de passe.",
        title: "Créer un nouvel utilisateur",
      },
      edit: {
        error: "Une erreur s'est produite. Veuillez réessayer.",
        record_not_found: "Enregistrement introuvable",
        success: "Utilisateur mis à jour avec succès",
        title: "Modifier %{name}",
      },
      action: {
        new: "Nouvel utilisateur",
      },
    },
    tasks: {
      name: "Tâche |||| Tâches",
      forcedCaseName: "Tâche",
      fields: {
        text: "Description",
        due_date: "Date d'échéance",
        type: "Type",
        contact_id: "Contact",
        due_short: "échéance",
      },
      action: {
        add: "Ajouter une tâche",
        create: "Créer une tâche",
        edit: "Modifier la tâche",
      },
      actions: {
        postpone_next_week: "Reporté à la semaine prochaine",
        postpone_tomorrow: "Reporter à demain",
        title: "Actions de tâche",
      },
      added: "Tâche ajoutée",
      deleted: "Tâche supprimée avec succès",
      dialog: {
        create: "Créer une tâche",
        create_for: "Créer une tâche pour %{name}",
      },
      sheet: {
        edit: "Modifier la tâche",
        edit_for: "Modifier la tâche pour %{name}",
      },
      empty: "Aucune tâche pour l'instant",
      empty_list_hint: "Les tâches ajoutées à vos contacts apparaîtront ici.",
      filters: {
        later: "Plus tard",
        overdue: "En retard",
        this_week: "Cette semaine",
        today: "Aujourd'hui",
        tomorrow: "Demain",
        with_pending: "Avec des tâches en attente",
      },
      regarding_contact: "(Concernant : %{name})",
      updated: "Tâche mise à jour",
    },
    tags: {
      name: "Étiquette |||| Étiquettes",
      action: {
        add: "Ajouter une étiquette",
        create: "Créer une nouvelle étiquette",
      },
      dialog: {
        color: "Couleur",
        create_title: "Créer une nouvelle étiquette",
        edit_title: "Modifier l'étiquette",
        name_label: "Nom de l'étiquette",
        name_placeholder: "Saisir le nom de l'étiquette",
      },
    },
    subscriptions: {
      name: "Abonnement |||| Abonnements",
      forcedCaseName: "Abonnement",
      fields: {
        contact_id: "Élève",
        total_sessions: "Séances totales",
        purchased_at: "Date d'achat",
        price: "Prix",
        notes: "Notes",
        sessions_used: "Séances utilisées",
        sessions_remaining: "Séances restantes",
        sales_id: "Responsable de compte",
        created_at: "Créé le",
      },
      action: {
        new: "Nouvel abonnement",
        create: "Créer un abonnement",
        edit: "Modifier l'abonnement",
      },
      empty: {
        title: "Aucun abonnement trouvé",
        description: "Il semble qu'il n'y ait pas encore d'abonnements.",
      },
    },
    sessions: {
      name: "Séance |||| Séances",
      forcedCaseName: "Séance",
      fields: {
        starts_at: "Date et heure de début",
        duration_minutes: "Durée (minutes)",
        capacity: "Capacité",
        overbooking: "Surbooking",
        notes: "Notes",
        bookings: "Réservations",
        sales_id: "Responsable de compte",
        created_at: "Créé le",
      },
      action: {
        new: "Nouvelle séance",
        create: "Créer une séance",
        edit: "Modifier la séance",
      },
      empty: {
        title: "Aucune séance trouvée",
        description: "Il semble qu'il n'y ait pas encore de séances à venir.",
      },
      roster: {
        title: "Liste des participants",
        placeholder:
          "La liste des participants apparaîtra ici une fois les réservations ajoutées.",
      },
    },
    bookings: {
      name: "Réservation |||| Réservations",
      forcedCaseName: "Réservation",
      fields: {
        session_id: "Séance",
        contact_id: "Élève",
        subscription_id: "Abonnement",
        type: "Type de réservation",
        status: "Statut",
        cancelled_at: "Annulé le",
        sales_id: "Responsable de compte",
        created_at: "Créé le",
      },
      type: {
        subscription: "Abonnement",
        single: "Séance unique",
        discovery: "Découverte",
      },
      status: {
        booked: "Réservé",
        attended: "Présent",
        cancelled: "Annulé",
        no_show: "Absent",
      },
      action: {
        add_student: "Ajouter un élève",
        buy_pack: "Acheter un pack",
        mark_attended: "Présent",
        mark_no_show: "Absent",
        cancel: "Annuler",
        created: "Réservation créée",
        pack_created: "Abonnement créé",
        status_updated: "Réservation mise à jour",
      },
      panel: {
        history: "Historique des réservations",
        empty: "Aucune réservation pour l'instant",
      },
    },
  },
  crm: {
    action: {
      reset_password: "Réinitialiser le mot de passe",
    },
    auth: {
      first_name: "Prénom",
      last_name: "Nom",
      confirm_password: "Confirmer le mot de passe",
      confirmation_required:
        "Veuillez suivre le lien que nous venons de vous envoyer par email pour confirmer votre compte.",
      recovery_email_sent:
        "Si vous êtes un utilisateur enregistré, vous devriez recevoir prochainement un e-mail de récupération de mot de passe.",
      sign_in_failed: "Échec de la connexion.",
      sign_in_google_workspace: "Connectez-vous avec Google Workplace",
      signup: {
        create_account: "Créer un compte",
        create_first_user:
          "Créez le premier compte utilisateur pour terminer la configuration.",
        creating: "Création...",
        initial_user_created: "Utilisateur initial créé avec succès",
      },
      welcome_title: "Bienvenue sur Atomic CRM",
    },
    common: {
      activity: "Activité",
      added: "ajoutée",
      details: "Détails",
      last_activity_with_date: "dernière activité %{date}",
      load_more: "Charger plus",
      misc: "Divers",
      past: "Passé",
      read_more: "En savoir plus",
      retry: "Réessayer",
      show_less: "Afficher moins",
      task_count: "%{smart_count} tâche |||| %{smart_count} tâches",
      copied: "Copié !",
      copy: "Copier",
      loading: "Chargement...",
      me: "Moi",
    },
    changelog: {
      title: "Notes de version",
    },
    activity: {
      added_contact: "%{name} a ajouté le contact",
      you_added_contact: "Vous avez ajouté le contact",
      added_note: "%{name} a ajouté une note sur",
      you_added_note: "Vous avez ajouté une note sur",
      load_more: "Charger plus d'activité",
    },
    dashboard: {
      latest_activity: "Dernière activité",
      latest_activity_error:
        "Erreur lors du chargement de la dernière activité",
      latest_notes: "Mes dernières notes",
      latest_notes_added_ago: "ajouté %{timeAgo}",
      stepper: {
        install: "Installer Atomic CRM",
        progress: "%{step}/3 terminé",
        whats_next: "Et ensuite ?",
      },
      upcoming_tasks: "Tâches à venir",
      monthly_recap: {
        title: "Récapitulatif mensuel",
        column_student: "Élève",
        column_sessions_attended: "Séances assistées",
        column_prepaid_remaining: "Séances prépayées restantes",
        month_picker_label: "Mois",
        empty: "Aucune donnée de présence pour ce mois.",
      },
    },
    header: {
      import_data: "Importer des données",
    },
    image_editor: {
      change: "Changer",
      drop_hint:
        "Déposez un fichier à télécharger ou cliquez pour le sélectionner.",
      editable_content: "Contenu modifiable",
      title: "Télécharger et redimensionner l'image",
      update_image: "Mettre à jour l'image",
    },
    import: {
      action: {
        download_error_report: "Téléchargez le rapport d'erreur",
        import: "Importer",
        import_another: "Importer un autre fichier",
      },
      error: {
        unable: "Impossible d'importer ce fichier.",
      },
      idle: {
        description_1:
          "Vous pouvez importer des ventes, des contacts, des notes et des tâches.",
        description_2:
          "Les données doivent se trouver dans un fichier JSON correspondant à l'exemple suivant :",
      },
      status: {
        all_success: "Tous les enregistrements ont été importés avec succès.",
        complete: "Importation terminée.",
        failed: "Échoué",
        imported: "Importé",
        in_progress: "Import en cours, veuillez ne pas quitter cette page.",
        some_failed: "Certains enregistrements n'ont pas été importés.",
        table_caption: "Statut d'importation",
      },
      title: "Importer des données",
    },
    settings: {
      about: "À propos",
      dark_mode_logo: "Logo du mode sombre",
      light_mode_logo: "Logo du mode clair",
      notes: {
        statuses: "Statuts",
      },
      reset_defaults: "Réinitialiser aux valeurs par défaut",
      save_error: "Échec de l'enregistrement de la configuration",
      saved: "Configuration enregistrée avec succès",
      saving: "Enregistrement...",
      tasks: {
        types: "Types",
      },
      preferences: "Préférences",
      title: "Paramètres",
      app_title: "Titre de l'application",
      sections: {
        branding: "Image de marque",
      },
    },
    theme: {
      dark: "Sombre",
      label: "Thème",
      light: "Clair",
      system: "Système",
    },
    language: "Langue",
    navigation: {
      label: "Navigation CRM",
    },
    profile: {
      inbound: {
        description:
          "Vous pouvez commencer à envoyer des e-mails vers l'adresse de réception de votre serveur, par exemple en l'ajoutant au champ %{field}. Atomic CRM traitera les e-mails et ajoutera des notes aux contacts correspondants.",
        title: "E-mail entrant",
      },
      mcp: {
        title: "Serveur MCP",
        description:
          "Utilisez cette URL pour connecter votre assistant IA aux données de votre CRM via le Model Context Protocol (MCP).",
      },
      password: {
        change: "Changer le mot de passe",
      },
      password_reset_sent:
        "Un e-mail de réinitialisation du mot de passe a été envoyé à votre adresse e-mail",
      record_not_found: "Enregistrement introuvable",
      title: "Profil",
      updated: "Votre profil a été mis à jour",
      update_error: "Une erreur s'est produite. Veuillez réessayer",
    },
    validation: {
      invalid_url: "Doit être une URL valide",
      invalid_linkedin_url: "L'URL doit provenir de linkedin.com",
    },
  },
} satisfies CrmMessages;
