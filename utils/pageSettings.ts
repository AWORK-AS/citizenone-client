/**
 * Which settings pages configure which part of the app.
 *
 * The problem this solves: the settings live in one long list of their own, so
 * changing what a page offers means knowing that shift types are called
 * "Vagttyper" and sit three clicks away under Virksomhed → Katalog. Nobody
 * standing on the duty schedule guesses that. The navbar shortcut reads this
 * map and offers exactly the settings behind the page you are looking at.
 *
 * Keys are Nuxt route names, matched longest-first, so a specific tab can offer
 * something different from the page it sits on. Values are hrefs from the
 * settings catalog; an href that no longer exists there is dropped rather than
 * rendered as a dead link.
 */
export const PAGE_SETTINGS: Record<string, string[]> = {
    'schedules': [
        '/settings/shifts',
        '/settings/duty-shift-rules',
        '/settings/schedule-tags',
        '/settings/norm-periods',
        '/settings/wage-supplement-rules',
        '/settings/extra-hours-tags',
        '/settings/time-accounts',
        '/settings/absences',
        '/settings/employee-groups',
    ],
    'my-availability': ['/settings/shifts', '/settings/absences'],
    'calendar': ['/settings/calendar-tags', '/settings/booking-tags', '/settings/rooms'],
    'booking': ['/settings/booking-tags', '/settings/rooms', '/settings/calendar-tags'],
    'rooms': ['/settings/rooms'],

    'citizens': [
        '/settings/custom-pages',
        '/settings/departments',
        '/settings/sections',
        '/settings/relationships',
        '/settings/contact-job-titles',
        '/settings/addictions',
        '/settings/diagnoses',
        '/settings/timeline-event-types',
        '/settings/expense-categories',
    ],
    'citizens-uuid-journals': [
        '/settings/journal-titles',
        '/settings/journal-contents',
        '/settings/journal-note-tags',
        '/settings/consent-declaration-types',
    ],
    'citizens-uuid-medicine-journals': [
        '/settings/medicines',
        '/settings/dosage-forms',
        '/settings/mass-units',
        '/settings/medication-allergies',
        '/settings/units',
    ],
    'citizens-uuid-contacts': ['/settings/contact-job-titles', '/settings/relationships'],
    'citizens-uuid-nursing-areas': ['/settings/nursing-professional-record-templates'],
    'citizens-uuid-tooth-chart': ['/settings/treatment-templates'],

    'journal-notes': [
        '/settings/journal-titles',
        '/settings/journal-contents',
        '/settings/journal-note-tags',
        '/settings/consent-declaration-types',
    ],
    'medicine-missed-doses': ['/settings/medicines', '/settings/dosage-forms'],
    'drive': ['/settings/storage', '/settings/gdpr-retention'],
    'messages': ['/settings/message-templates'],
    'mail': ['/settings/message-templates'],
    'protocols': ['/settings/absences', '/settings/departments'],

    'employees': [
        '/settings/job-titles',
        '/settings/employee-groups',
        '/settings/departments',
        '/settings/sections',
        '/settings/roles',
        '/settings/absences',
        '/settings/time-accounts',
        '/settings/employment-agreements',
    ],

    'forms': ['/settings/report-templates'],
    'reports': ['/settings/report-templates'],
    'surveys': ['/settings/journal-titles'],
    'tasks': ['/settings/task-types', '/settings/task-rules'],
    'inquiries': [
        '/settings/inquiry-pipeline-stages',
        '/settings/inquiry-fields',
        '/settings/inquiry-service-types',
        '/settings/consultant-skills',
    ],
    'economy': ['/settings/employment-billing-rules', '/settings/expense-categories'],
    'dental-recalls': ['/settings/treatment-templates'],
    'dental-overview': ['/settings/treatment-templates'],
    'news': ['/settings/departments'],
    'overview': ['/settings/company', '/settings/custom-pages'],
}

/**
 * The settings hrefs for a route, taking the most specific entry that matches.
 * `citizens-uuid-journals` gets the journal settings rather than the citizen
 * ones it would inherit from a plain prefix match on `citizens`.
 */
export function settingsHrefsForRoute(routeName?: string | null): string[] {
    if (!routeName) return []
    const keys = Object.keys(PAGE_SETTINGS)
        .filter((key) => routeName === key || routeName.startsWith(key + '-'))
        .sort((a, b) => b.length - a.length)
    return keys.length ? PAGE_SETTINGS[keys[0]] : []
}
