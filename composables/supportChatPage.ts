// What the support chat (Milo, the Obiyen widget) is told about the page the
// user is on: whether to show at all, and the menu name of the section.
//
// Only a name from this list ever leaves the app. The path itself, and the
// page title, can hold a citizen's id or name, and the name goes into the
// assistant's prompt.
//
// Kept dependency-free (no vue / vue-i18n / Nuxt auto-imports), matching
// composables/dutyDayLoad.ts, so tests/unit/*.test.mjs can import this .ts.

/** First path segment => the sidebar's i18n key for that section. */
export const SECTION_LABEL_KEYS: Record<string, string> = {
    'overview': 'sidebar.overview',
    'my-day': 'sidebar.myDay',
    'citizens': 'sidebar.citizens',
    'citizen': 'sidebar.citizens',
    'calendar': 'sidebar.calendar',
    'messages': 'sidebar.messages',
    'journal-notes': 'sidebar.journalNotes',
    'drive': 'sidebar.documents',
    'forms': 'sidebar.forms',
    'schedules': 'sidebar.dutySchedules',
    'my-availability': 'sidebar.myAvailability',
    'my-shift-evaluations': 'sidebar.myShiftEvaluations',
    'mail': 'sidebar.mail',
    'reports': 'sidebar.reports',
    'surveys': 'sidebar.surveys',
    'tasks': 'sidebar.Tasks',
    'invoicing': 'sidebar.invoicing',
    'dental-recalls': 'sidebar.dentalRecalls',
    'dental-overview': 'sidebar.dentalOverview',
    'plans-goals-subgoals-completions': 'sidebar.plansAndGoalsExport',
    'discover': 'sidebar.discover',
}

/**
 * Superadmin is our own back office: no support chat there. Anywhere else,
 * the i18n key of the section's name, or null for a section without one,
 * which clears the name the chat was given before.
 */
export function supportChatPage(path: string): { hidden: boolean, labelKey: string | null } {
    const section = String(path ?? '').split(/[?#]/)[0].split('/').filter(Boolean)[0] ?? ''

    return {
        hidden: section === 'superadmin',
        labelKey: Object.hasOwn(SECTION_LABEL_KEYS, section) ? SECTION_LABEL_KEYS[section] : null,
    }
}
