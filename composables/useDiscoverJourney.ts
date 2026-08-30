// The Discover journey, per industry.
//
// A customer arrives here straight from the marketing site, where they read
// about their own profession and clicked "Opret gratis konto" on a page that
// carried their industry into `/register?industry=`. The checklist they meet
// on the other side has to continue that sentence: a dental clinic is asked
// about patients, opening hours and dental journal templates, not about
// "borgere", medicine cards and a duty schedule it does not run.
//
// So the journey is picked by the company's industry `system_name` — the same
// field the rest of the product already branches on — and falls back to a
// neutral set for the 56 industries that have no journey of their own.
//
// Groups can also name a `page`. That is a real module name from the Page
// table, the one `/settings/company` and the sidebar are driven by, so a group
// disappears when the company does not have the module rather than sending
// somebody to a screen their menu does not contain.

export interface DiscoverStep {
    key: string
    route?: string
    action?: string
    doneKey?: string
    tip?: boolean
    lockedUntil?: string
}

export interface DiscoverGroup {
    key: string
    icon: string
    steps: DiscoverStep[]
    /** Page (module) name this group needs. Null = always relevant. */
    page?: string | null
    /** Coarse Discover toggle, used only until the company has real Page rows. */
    module?: string | null
    adminOnly?: boolean
}

const migration: DiscoverGroup = {
    key: 'migration', icon: 'ph:download-simple', adminOnly: true,
    steps: [{ key: 'import', action: 'import' }],
}

const getStarted: DiscoverGroup = {
    key: 'komIGang', icon: 'ph:buildings',
    steps: [
        { key: 'departments', tip: true, route: '/settings/departments', doneKey: 'departments' },
        { key: 'roles', route: '/settings/roles' },
        { key: 'employees', route: '/employees', doneKey: 'employees', lockedUntil: 'departments' },
    ],
}

const dutySchedule: DiscoverGroup = {
    key: 'vagtplan', icon: 'ph:calendar-dots', page: 'Duty Schedule', module: 'vagtplan',
    steps: [
        { key: 'shiftTypes', route: '/settings/duty-shift-rules' },
        { key: 'shiftTags', route: '/settings/schedule-tags', doneKey: 'shiftTags' },
        { key: 'schedule', route: '/schedules' },
    ],
}

const medicine: DiscoverGroup = {
    key: 'medicin', icon: 'ph:pill', page: 'Medicine card', module: 'medicin',
    steps: [{ key: 'medicine', route: '/settings/medicines' }],
}

// The old version sent this one to `/settings/roles`, which is where roles are,
// not where journal templates are. Both title and route were wrong.
const documentation: DiscoverGroup = {
    key: 'dokumentation', icon: 'ph:files', page: 'Journals', module: 'dokumentation',
    steps: [
        { key: 'journalTitles', route: '/settings/journal-titles' },
        { key: 'journalContents', route: '/settings/journal-contents' },
    ],
}

const JOURNEYS: Record<string, DiscoverGroup[]> = {
    social_welfare: [
        migration,
        getStarted,
        {
            key: 'people', icon: 'ph:users-three',
            steps: [
                { key: 'citizens', route: '/citizens', doneKey: 'citizens' },
                { key: 'citizenData', route: '/citizens' },
            ],
        },
        dutySchedule,
        medicine,
        documentation,
    ],

    dental: [
        migration,
        getStarted,
        {
            key: 'patients', icon: 'ph:tooth',
            steps: [
                { key: 'patients', route: '/citizens', doneKey: 'citizens' },
                { key: 'patientData', route: '/citizens' },
            ],
        },
        {
            key: 'clinic', icon: 'ph:calendar-check', page: 'Calendar',
            steps: [
                { key: 'openingHours', route: '/settings/company' },
                { key: 'booking', route: '/booking' },
            ],
        },
        documentation,
        medicine,
    ],

    employment_services: [
        migration,
        getStarted,
        {
            key: 'people', icon: 'ph:users-three',
            steps: [
                { key: 'citizens', route: '/citizens', doneKey: 'citizens' },
                { key: 'citizenData', route: '/citizens' },
            ],
        },
        {
            key: 'cases', icon: 'ph:briefcase', page: 'Economy',
            steps: [
                { key: 'caseTypes', route: '/settings/employment-case-types' },
                { key: 'jobcenters', route: '/settings/employment-jobcenters' },
            ],
        },
        documentation,
    ],
}

const DEFAULT_JOURNEY: DiscoverGroup[] = [
    migration,
    getStarted,
    {
        key: 'people', icon: 'ph:users-three',
        steps: [
            { key: 'citizens', route: '/citizens', doneKey: 'citizens' },
            { key: 'citizenData', route: '/citizens' },
        ],
    },
    documentation,
    dutySchedule,
    medicine,
]

// Magtanvendelse is a social-sector obligation and predefined note content is
// written for it, so the "what do you need" list only offers them where they
// mean something. The rest of the toggles map onto real modules.
const MODULE_OPTIONS = [
    { key: 'vagtplan', icon: 'ph:calendar-dots', industries: null },
    { key: 'medicin', icon: 'ph:pill', industries: null },
    { key: 'dokumentation', icon: 'ph:files', industries: null },
    { key: 'useOfForce', icon: 'ph:shield-warning', industries: ['social_welfare', 'employment_services'] },
    { key: 'predefinedContent', icon: 'ph:list-bullets', industries: ['social_welfare', 'employment_services'] },
]

export function useDiscoverJourney(systemName: () => string | null | undefined) {
    const journey = computed<DiscoverGroup[]>(() => {
        const key = systemName()
        return (key && JOURNEYS[key]) || DEFAULT_JOURNEY
    })

    const moduleOptions = computed(() => {
        const key = systemName()
        return MODULE_OPTIONS.filter(option =>
            option.industries === null || (!!key && option.industries.includes(key)))
    })

    return { journey, moduleOptions }
}
