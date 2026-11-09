// What pressing a starter in Cody's empty thread does. Pure, for node --test.
//
// One rule, the same one the "Spørg Cody AI" button on a brief line follows:
// a prompt that is a complete question is asked at once; a prompt that stops
// mid-sentence ("Skriv et journalnotat for ", "Find de vedhæftede filer om ")
// needs a name from the user, so it is put in the field with the cursor at the
// end instead. An unfinished prompt is recognised by its trailing space, which
// is how the quickPrompts strings in lang/*.json already mark it. A prompt that
// ends in "@" ("Skriv en besked til @") waits for a colleague: the "@" opens the
// mention picker as soon as it is in the field.

export type StarterMode = 'send' | 'fill'

export function starterMode(prompt: string): StarterMode {
    return /(\s|@)$/.test(prompt) ? 'fill' : 'send'
}

// Which starters the empty thread offers, by the page the user has open. A
// starter is a promise about what Cody AI can do, so one whose tool sits behind
// a module or an app the company has not got is not offered: the server would
// only refuse it. Pure, for node --test - the caller says what is enabled.

export interface Starter {
    /** Under assistants.quick (the label) and assistants.quickPrompts (what is asked). */
    key: string
    icon: string
    /** A company module (`module_pages`) the answer needs. */
    module?: string
    /** Needs the tasks app: the task tools are gated by it on the server. */
    tasks?: boolean
}

export interface StarterAccess {
    hasModule: (name: string) => boolean
    tasksEnabled: boolean
}

const STARTER: Record<string, Starter> = {
    overview: { key: 'overview', icon: 'ph:file-text' },
    journal: { key: 'journal', icon: 'ph:pencil-simple-line', module: 'Journals' },
    files: { key: 'files', icon: 'ph:paperclip', module: 'Documents' },
    shifts: { key: 'shifts', icon: 'ph:calendar-blank', module: 'Duty Schedule' },
    citizenWeek: { key: 'citizenWeek', icon: 'ph:clock-counter-clockwise', module: 'Journals' },
    citizenGoals: { key: 'citizenGoals', icon: 'ph:target', module: 'Plans and goals' },
    citizenNote: { key: 'citizenNote', icon: 'ph:pencil-simple-line', module: 'Journals' },
    nextShift: { key: 'nextShift', icon: 'ph:calendar-check', module: 'Duty Schedule' },
    myTasks: { key: 'myTasks', icon: 'ph:kanban', module: 'Tasks', tasks: true },
    newTask: { key: 'newTask', icon: 'ph:plus-circle', module: 'Tasks', tasks: true },
    unread: { key: 'unread', icon: 'ph:chat-circle-dots', module: 'Messages' },
    message: { key: 'message', icon: 'ph:chat-circle-text', module: 'Messages' },
}

/**
 * Page group -> starters, most useful first. Each list ends in general ones, so
 * a company without the page's own modules still gets a full row.
 */
const PAGE_STARTERS: Record<string, string[]> = {
    default: ['overview', 'journal', 'message', 'shifts', 'files'],
    citizen: ['citizenWeek', 'citizenGoals', 'citizenNote', 'files', 'overview'],
    schedule: ['nextShift', 'shifts', 'overview', 'journal', 'files'],
    tasks: ['myTasks', 'newTask', 'overview', 'shifts', 'journal'],
    messages: ['unread', 'overview', 'shifts', 'journal', 'files'],
}

export const MAX_STARTERS = 4

/**
 * The page group for a page key from useCodyPageContext, falling back to the
 * route name for pages Cody is not told about (the task board).
 */
export function starterGroup(pageKey: string | null | undefined, routeName: string): string | null {
    if (pageKey && pageKey.startsWith('citizen_') && pageKey !== 'citizen_list') return 'citizen'
    if (pageKey === 'duty_schedule' || pageKey === 'employee_schedule' || pageKey === 'calendar') return 'schedule'
    if (pageKey === 'messages') return 'messages'
    if (routeName === 'tasks' || routeName.startsWith('tasks-')) return 'tasks'

    return null
}

export function starterAvailable(starter: Starter, access: StarterAccess): boolean {
    if (starter.tasks && !access.tasksEnabled) return false

    return !starter.module || access.hasModule(starter.module)
}

/** Up to four starters for this page, leaving out any the company cannot use. */
export function startersFor(group: string | null, access: StarterAccess): Starter[] {
    return (PAGE_STARTERS[group ?? 'default'] ?? PAGE_STARTERS.default)
        .map((key) => STARTER[key])
        .filter((starter) => starter && starterAvailable(starter, access))
        .slice(0, MAX_STARTERS)
}

/** Every starter key, so a test can hold the language files to them. */
export const STARTER_KEYS = Object.keys(STARTER)
