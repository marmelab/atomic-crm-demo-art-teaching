export const englishCrmMessages = {
  resources: {
    contacts: {
      name: "Student |||| Students",
      forcedCaseName: "Student",
      field_categories: {
        background_info: "Background info",
        identity: "Identity",
        misc: "Misc",
        personal_info: "Personal info",
      },
      fields: {
        first_name: "First name",
        last_name: "Last name",
        last_seen: "Last seen",
        email_jsonb: "Email addresses",
        email: "Email",
        phone_jsonb: "Phone numbers",
        phone_number: "Phone number",
        linkedin_url: "LinkedIn URL",
        background: "Background info (bio, how you met, etc)",
        has_newsletter: "Has newsletter",
        sales_id: "Account manager",
      },
      action: {
        add: "Add student",
        add_first: "Add your first student",
        create: "Create student",
        edit: "Edit student",
        export_vcard: "Export to vCard",
        new: "New Student",
        show: "Show student",
      },
      background: {
        last_activity_on: "Last activity on %{date}",
        added_on: "Added on %{date}",
        followed_by: "Followed by %{name}",
        followed_by_you: "Followed by you",
        status_none: "None",
      },
      empty: {
        description: "It seems your student list is empty.",
        title: "No students found",
      },
      import: {
        title: "Import students",
        button: "Import CSV",
        complete:
          "Students import complete. Imported %{importCount} students, with %{errorCount} errors",
        progress:
          "Imported %{importCount} / %{rowCount} students, with %{errorCount} errors.",
        error:
          "Failed to import this file, please make sure your provided a valid CSV file.",
        imported: "Imported",
        remaining_time: "Estimated remaining time:",
        running: "The import is running, please do not close this tab.",
        sample_download: "Download CSV sample",
        sample_hint: "Here is a sample CSV file you can use as a template",
        stop: "Stop import",
        csv_file: "CSV File",
        contacts_label: "student |||| students",
      },
      inputs: {
        genders: {
          male: "He/Him",
          female: "She/Her",
          nonbinary: "They/Them",
        },
        personal_info_types: {
          work: "Work",
          home: "Home",
          other: "Other",
        },
      },
      list: {
        error_loading: "Error loading students",
      },
      bulk_tag: {
        action: "Tag",
        back: "Back to tags",
        create_description:
          "Create a new tag and apply it to the selected students.",
        description:
          "Choose an existing tag or create a new one for the selected students.",
        empty: "No tags yet. Create one to tag the selected students.",
        error: "Failed to add tag to students",
        noop: "Selected students already have this tag",
        success:
          "Tag added to %{smart_count} student |||| Tag added to %{smart_count} students",
        title: "Add tag to students",
      },
      merge: {
        action: "Merge with another student",
        confirm: "Merge Students",
        current_contact: "Current Student (will be deleted)",
        description: "Merge this student with another one.",
        error: "Failed to merge students",
        merging: "Merging...",
        no_additional_data: "No additional data to merge",
        select_target: "Please select a student to merge with",
        success: "Students merged successfully",
        target_contact: "Target Student (will be kept)",
        title: "Merge Student",
        warning_description:
          "All data will be transferred to the second student. This action cannot be undone.",
        warning_title: "Warning: Destructive Operation",
        what_will_be_merged: "What will be merged:",
      },
      filters: {
        before_last_month: "Before last month",
        before_this_month: "Before this month",
        before_this_week: "Before this week",
        managed_by_me: "Managed by me",
        search: "Search name...",
        this_week: "This week",
        today: "Today",
        tags: "Tags",
        tasks: "Tasks",
      },
      hot: {
        empty_change_status:
          'Change the status of a student by adding a note to that student and clicking on "show options".',
        empty_hint: 'Students with a "hot" status will appear here.',
        title: "Hot Students",
      },
    },
    notes: {
      name: "Note |||| Notes",
      forcedCaseName: "Note",
      fields: {
        status: "Status",
        date: "Date",
        attachments: "Attachments",
        contact_id: "Contact",
      },
      action: {
        add: "Add note",
        add_first: "Add your first note",
        delete: "Delete note",
        edit: "Edit note",
        update: "Update note",
        add_this: "Add this note",
      },
      sheet: {
        create: "Create note",
        create_for: "Create note for %{name}",
        edit: "Edit note",
        edit_for: "Edit note for %{name}",
      },
      deleted: "Note deleted",
      empty: "No notes yet",
      author_added: "%{name} added a note",
      you_added: "You added a note",
      me: "Me",
      list: {
        error_loading: "Error loading notes",
      },
      note_for_contact: "Note for %{name}",
      stepper: {
        hint: "Go to a contact page and add a note",
      },
      added: "Note added",
      inputs: {
        add_note: "Add a note",
        options_hint: "(attach files, or change details)",
        show_options: "Show options",
      },
      actions: {
        attach_document: "Attach document",
      },
      validation: {
        note_or_attachment_required: "A note or an attachment is required",
      },
    },
    sales: {
      name: "User |||| Users",
      fields: {
        first_name: "First name",
        last_name: "Last name",
        email: "Email",
        administrator: "Admin",
        disabled: "Disabled",
      },
      create: {
        error: "An error occurred while creating the user.",
        success:
          "User created. They will soon receive an email to set their password.",
        title: "Create a new user",
      },
      edit: {
        error: "An error occurred. Please try again.",
        record_not_found: "Record not found",
        success: "User updated successfully",
        title: "Edit %{name}",
      },
      action: {
        new: "New user",
      },
    },
    tasks: {
      name: "Task |||| Tasks",
      forcedCaseName: "Task",
      fields: {
        text: "Description",
        due_date: "Due date",
        type: "Type",
        contact_id: "Contact",
        due_short: "due",
      },
      action: {
        add: "Add task",
        create: "Create task",
        edit: "Edit task",
      },
      actions: {
        postpone_next_week: "Postpone to next week",
        postpone_tomorrow: "Postpone to tomorrow",
        title: "task actions",
      },
      added: "Task added",
      deleted: "Task deleted successfully",
      dialog: {
        create: "Create task",
        create_for: "Create task for %{name}",
      },
      sheet: {
        edit: "Edit task",
        edit_for: "Edit task for %{name}",
      },
      empty: "No tasks yet",
      empty_list_hint: "Tasks added to your contacts will appear here.",
      filters: {
        later: "Later",
        overdue: "Overdue",
        this_week: "This week",
        today: "Today",
        tomorrow: "Tomorrow",
        with_pending: "With pending tasks",
      },
      regarding_contact: "(Re: %{name})",
      updated: "Task updated",
    },
    tags: {
      name: "Tag |||| Tags",
      action: {
        add: "Add tag",
        create: "Create new tag",
      },
      dialog: {
        color: "Color",
        create_title: "Create a new tag",
        edit_title: "Edit tag",
        name_label: "Tag name",
        name_placeholder: "Enter tag name",
      },
    },
    subscriptions: {
      name: "Subscription |||| Subscriptions",
      forcedCaseName: "Subscription",
      fields: {
        contact_id: "Student",
        total_sessions: "Total sessions",
        purchased_at: "Purchase date",
        price: "Price",
        notes: "Notes",
        sessions_used: "Sessions used",
        sessions_remaining: "Sessions remaining",
        sales_id: "Account manager",
        created_at: "Created at",
      },
      action: {
        new: "New subscription",
        create: "Create subscription",
        edit: "Edit subscription",
      },
      empty: {
        title: "No subscriptions found",
        description: "It seems there are no subscriptions yet.",
      },
    },
    sessions: {
      name: "Session |||| Sessions",
      forcedCaseName: "Session",
      fields: {
        starts_at: "Start date & time",
        duration_minutes: "Duration (minutes)",
        capacity: "Capacity",
        overbooking: "Overbooking",
        notes: "Notes",
        bookings: "Bookings",
        sales_id: "Account manager",
        created_at: "Created at",
      },
      action: {
        new: "New session",
        create: "Create session",
        edit: "Edit session",
      },
      empty: {
        title: "No sessions found",
        description: "It seems there are no upcoming sessions.",
      },
      roster: {
        title: "Roster",
        placeholder: "Student roster will appear here once bookings are added.",
      },
      calendar: {
        title: "Calendar",
        today: "Today",
        prev: "Previous period",
        next: "Next period",
        prev_week: "Previous week",
        next_week: "Next week",
        hour_gutter: "Hour labels",
        view_week: "Week",
        view_month: "Month",
        view_toggle_label: "Calendar view",
        fetch_error: "Unable to load sessions. Please try again.",
      },
    },
    bookings: {
      name: "Booking |||| Bookings",
      forcedCaseName: "Booking",
      fields: {
        session_id: "Session",
        contact_id: "Student",
        subscription_id: "Subscription",
        type: "Booking type",
        status: "Status",
        cancelled_at: "Cancelled at",
        sales_id: "Account manager",
        created_at: "Created at",
      },
      type: {
        subscription: "Subscription",
        single: "Single",
        discovery: "Discovery",
      },
      status: {
        booked: "Booked",
        attended: "Attended",
        cancelled: "Cancelled",
        no_show: "No-show",
      },
      action: {
        add_student: "Add student",
        buy_pack: "Buy pack",
        mark_attended: "Attended",
        mark_no_show: "No-show",
        cancel: "Cancel",
        created: "Booking created",
        pack_created: "Subscription created",
        status_updated: "Booking updated",
      },
      notification: {
        session_full: "This class is full and cannot take any more students.",
        subscription_exhausted:
          "This pack has no sessions left. Sell a new pack before marking attendance.",
      },
      panel: {
        history: "Booking history",
        empty: "No bookings yet",
      },
    },
  },
  crm: {
    action: {
      reset_password: "Reset Password",
    },
    auth: {
      first_name: "First name",
      last_name: "Last name",
      confirm_password: "Confirm password",
      confirmation_required:
        "Please follow the link we just sent you by email to confirm your account.",
      recovery_email_sent:
        "If you're a registered user, you should receive a password recovery email shortly.",
      sign_in_failed: "Failed to log in.",
      sign_in_google_workspace: "Sign in with Google Workplace",
      signup: {
        create_account: "Create account",
        create_first_user:
          "Create the first user account to complete the setup.",
        creating: "Creating...",
        initial_user_created: "Initial user successfully created",
      },
      welcome_title: "Welcome to Atomic CRM",
    },
    common: {
      activity: "Activity",
      added: "added",
      details: "Details",
      last_activity_with_date: "last activity %{date}",
      load_more: "Load more",
      misc: "Misc",
      past: "Past",
      read_more: "Read more",
      retry: "Retry",
      show_less: "Show less",
      copied: "Copied!",
      copy: "Copy",
      loading: "Loading...",
      me: "Me",
      task_count: "%{smart_count} task |||| %{smart_count} tasks",
    },
    changelog: {
      title: "Changelog",
    },
    activity: {
      added_contact: "%{name} added",
      you_added_contact: "You added",
      added_note: "%{name} added a note about",
      you_added_note: "You added a note about",
      load_more: "Load more activity",
    },
    dashboard: {
      latest_activity: "Latest Activity",
      latest_activity_error: "Error loading latest activity",
      latest_notes: "My Latest Notes",
      latest_notes_added_ago: "added %{timeAgo}",
      stepper: {
        install: "Install Atomic CRM",
        progress: "%{step}/3 done",
        whats_next: "What's next?",
      },
      upcoming_tasks: "Upcoming Tasks",
      monthly_recap: {
        title: "Monthly Recap",
        column_student: "Student",
        column_sessions_attended: "Sessions attended",
        column_prepaid_remaining: "Prepaid remaining",
        month_picker_label: "Month",
        empty: "No attendance data for this month.",
      },
    },
    header: {
      import_data: "Import data",
    },
    image_editor: {
      change: "Change",
      drop_hint: "Drop a file to upload, or click to select it.",
      editable_content: "Editable content",
      title: "Upload and resize image",
      update_image: "Update Image",
    },
    import: {
      action: {
        download_error_report: "Download the error report",
        import: "Import",
        import_another: "Import another file",
      },
      error: {
        unable: "Unable to import this file.",
      },
      idle: {
        description_1: "You can import sales, contacts, notes, and tasks.",
        description_2:
          "Data must be in a JSON file matching the following sample:",
      },
      status: {
        all_success: "All records were imported successfully.",
        complete: "Import complete.",
        failed: "Failed",
        imported: "Imported",
        in_progress:
          "Import in progress, please don't navigate away from this page.",
        some_failed: "Some records were not imported.",
        table_caption: "Import status",
      },
      title: "Import Data",
    },
    settings: {
      about: "About",
      dark_mode_logo: "Dark Mode Logo",
      light_mode_logo: "Light Mode Logo",
      notes: {
        statuses: "Statuses",
      },
      reset_defaults: "Reset to Defaults",
      save_error: "Failed to save configuration",
      saved: "Configuration saved successfully",
      saving: "Saving...",
      tasks: {
        types: "Types",
      },
      preferences: "Preferences",
      title: "Settings",
      app_title: "App Title",
      sections: {
        branding: "Branding",
      },
    },
    theme: {
      dark: "Dark",
      label: "Theme",
      light: "Light",
      system: "System",
    },
    language: "Language",
    navigation: {
      label: "CRM navigation",
    },
    profile: {
      inbound: {
        description:
          "You can start sending emails to your server's inbound email address, e.g. by adding it to the %{field} field. Atomic CRM will process the emails and add notes to the corresponding contacts.",
        title: "Inbound email",
      },
      mcp: {
        title: "MCP Server",
        description:
          "Use this URL to connect your AI assistant to your CRM data via the Model Context Protocol (MCP).",
      },
      password: {
        change: "Change password",
      },
      password_reset_sent:
        "A reset password email has been sent to your email address",
      record_not_found: "Record not found",
      title: "Profile",
      updated: "Your profile has been updated",
      update_error: "An error occurred. Please try again",
    },
    validation: {
      invalid_url: "Must be a valid URL",
      invalid_linkedin_url: "URL must be from linkedin.com",
    },
  },
} as const;

type MessageSchema<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends Record<string, unknown>
      ? MessageSchema<T[K]>
      : never;
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown>
    ? DeepPartial<T[K]>
    : T[K];
};

export type CrmMessages = MessageSchema<typeof englishCrmMessages>;
export type PartialCrmMessages = DeepPartial<CrmMessages>;
