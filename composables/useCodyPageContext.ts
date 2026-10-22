/**
 * Which page the user has open, as Cody is allowed to know it.
 *
 * "Hvad står der her?" only makes sense to an assistant that knows where "her"
 * is. What is sent is a key from a fixed list and, on a citizen's pages, that
 * citizen's uuid - never the page's content. The backend has the same list
 * (App\Gpt\PageContext::PAGES), turns the key into a sentence it wrote itself,
 * and only names the citizen when the person asking may see them. A page not
 * listed here sends nothing.
 *
 * Most specific first: the first prefix that matches wins.
 */
const PAGES: Array<[prefix: string, key: CodyPageKey | null]> = [
    // A child's pages hang under the parent's uuid; saying "the citizen" there
    // would point at the wrong person.
    ['citizens-uuid-children', null],
    ['citizens-uuid-journals', 'citizen_journals'],
    ['citizens-uuid-medicine-journals', 'citizen_medicine'],
    ['citizens-uuid-plans-and-goals', 'citizen_plans_goals'],
    ['citizens-uuid-documents', 'citizen_documents'],
    ['citizens-uuid-calendar', 'citizen_calendar'],
    ['citizens-uuid-contacts', 'citizen_contacts'],
    ['citizens-uuid-relations', 'citizen_contacts'],
    ['citizens-uuid-nursing-areas', 'citizen_nursing'],
    ['citizens-uuid-wellbeing', 'citizen_wellbeing'],
    ['citizens-uuid-outcomes', 'citizen_wellbeing'],
    ['citizens-uuid-timeline', 'citizen_timeline'],
    ['citizens-uuid', 'citizen_profile'],
    ['citizens', 'citizen_list'],
    ['my-day', 'my_day'],
    ['overview', 'overview'],
    ['employees-employee_uuid-duty-schedule', 'employee_schedule'],
    ['employees', 'employees'],
    ['schedules', 'duty_schedule'],
    ['calendar', 'calendar'],
    ['messages', 'messages'],
    ['mail', 'mail'],
    ['journal-notes', 'journal_feed'],
    ['journal-notifications', 'journal_feed'],
    ['medicine-missed-doses', 'missed_doses'],
    ['reminders', 'reminders'],
    ['procedures', 'procedures'],
    ['reports', 'reports'],
    ['inquiries', 'inquiries'],
    ['economy', 'economy'],
    ['management-economy', 'economy'],
    ['invoices', 'economy'],
    ['invoicing', 'economy'],
    ['settings', 'settings'],
]

export type CodyPageKey =
    | 'my_day' | 'overview' | 'citizen_list' | 'citizen_profile' | 'citizen_journals' | 'citizen_medicine'
    | 'citizen_plans_goals' | 'citizen_documents' | 'citizen_calendar' | 'citizen_contacts' | 'citizen_nursing'
    | 'citizen_wellbeing' | 'citizen_timeline' | 'duty_schedule' | 'employee_schedule' | 'calendar' | 'messages'
    | 'mail' | 'journal_feed' | 'missed_doses' | 'reminders' | 'procedures' | 'reports' | 'inquiries'
    | 'employees' | 'economy' | 'settings'

export interface CodyPageContext {
    key: CodyPageKey
    citizenUuid: string | null
}

export function resolveCodyPage(routeName: string, params: Record<string, unknown>): CodyPageContext | null {
    const match = PAGES.find(([prefix]) => routeName === prefix || routeName.startsWith(`${prefix}-`))
    const key = match?.[1]
    if (!key) return null

    const uuid = typeof params.uuid === 'string' ? params.uuid : null

    return {
        key,
        citizenUuid: key.startsWith('citizen_') && key !== 'citizen_list' ? uuid : null,
    }
}

export function useCodyPageContext() {
    const route = useRoute()

    return computed(() => resolveCodyPage(String(route.name ?? ''), route.params as Record<string, unknown>))
}
