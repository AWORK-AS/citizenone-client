// The Discover journey, per industry.
//
// A customer arrives here straight from the marketing site, where they read
// about their own profession and clicked "Opret gratis konto" on a page that
// carried their industry into `/register?industry=`. The checklist they meet
// on the other side has to continue that sentence: a dental clinic is asked
// about patients, opening hours and dental journal templates, not about
// "borgere", medicine cards and a duty schedule it does not run.
//
// So the journey is picked by the company's industry `profile` (the backend's
// IndustryDefaults::profile(), which is the system name for the three that have
// one and health/therapy for the clinics and practices), and falls back to a
// neutral set for beauty, teaching and anything unknown.
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

// After the people group, not first: an import is for someone switching
// systems, and the first thing a new customer needs is one person and one note.
const migration: DiscoverGroup = {
    key: 'migration', icon: 'ph:download-simple', adminOnly: true,
    // Done as soon as the company has people of its own, imported or not.
    steps: [{ key: 'import', action: 'import', doneKey: 'citizens' }],
}

// The first note is the moment the product starts paying back. The overview
// already opens the new-note modal on ?action=new-note (the desktop Dock uses
// the same link), so the step reuses that instead of a second modal here.
const firstNote: DiscoverStep = { key: 'firstNote', route: '/overview?action=new-note' }

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

// A private practice's own people: the master data step talks about health
// information, not the caseworker the social sector's version asks for.
const practicePeople: DiscoverGroup = {
    key: 'people', icon: 'ph:users-three',
    steps: [
        { key: 'citizens', route: '/citizens', doneKey: 'citizens' },
        { key: 'clinicData', route: '/citizens' },
        firstNote,
    ],
}

// Opening hours and booking. `clinic` for health work, `practice` for therapy,
// so the heading says the word the customer uses about their own place.
const booking = (key: 'clinic' | 'practice'): DiscoverGroup => ({
    key, icon: 'ph:calendar-check', page: 'Calendar',
    steps: [
        { key: 'openingHours', route: '/settings/company' },
        { key: 'booking', route: '/booking' },
    ],
})

// A practice bills the person it treats, so the first invoice belongs in the
// first week rather than somewhere in the settings.
const invoicing: DiscoverGroup = {
    key: 'billing', icon: 'ph:receipt', page: 'Billing',
    steps: [
        { key: 'services', route: '/invoicing?tab=services' },
        { key: 'invoicing', route: '/invoicing' },
    ],
}

const JOURNEYS: Record<string, DiscoverGroup[]> = {
    // Doctors, chiropractors, nurses, midwives: IndustryDefaults::profile() `health`.
    health: [
        practicePeople,
        migration,
        booking('clinic'),
        invoicing,
        documentation,
        getStarted,
        medicine,
        dutySchedule,
    ],

    // Psychologists, physiotherapists, therapists, coaches: profile `therapy`.
    // Colleagues come late: most of these practices are one or two people.
    therapy: [
        practicePeople,
        migration,
        booking('practice'),
        invoicing,
        documentation,
        getStarted,
        dutySchedule,
    ],

    social_welfare: [
        {
            key: 'people', icon: 'ph:users-three',
            steps: [
                { key: 'citizens', route: '/citizens', doneKey: 'citizens' },
                { key: 'citizenData', route: '/citizens' },
                firstNote,
            ],
        },
        migration,
        getStarted,
        dutySchedule,
        medicine,
        documentation,
    ],

    dental: [
        {
            key: 'patients', icon: 'ph:tooth',
            steps: [
                { key: 'patients', route: '/citizens', doneKey: 'citizens' },
                { key: 'patientData', route: '/citizens' },
                firstNote,
            ],
        },
        migration,
        getStarted,
        {
            key: 'clinic', icon: 'ph:calendar-check', page: 'Calendar',
            steps: [
                { key: 'openingHours', route: '/settings/company' },
                { key: 'booking', route: '/booking' },
            ],
        },
        documentation,
        medicine,
        // A clinic with employees runs a rota like anybody else. Page-gated, so
        // it only shows up where the module is actually on.
        dutySchedule,
    ],

    employment_services: [
        {
            key: 'people', icon: 'ph:users-three',
            steps: [
                { key: 'citizens', route: '/citizens', doneKey: 'citizens' },
                { key: 'citizenData', route: '/citizens' },
                firstNote,
            ],
        },
        migration,
        getStarted,
        {
            key: 'cases', icon: 'ph:briefcase', page: 'Economy',
            steps: [
                { key: 'caseTypes', route: '/settings/employment-case-types' },
                { key: 'jobcenters', route: '/settings/employment-jobcenters' },
            ],
        },
        documentation,
        dutySchedule,
    ],
}

const DEFAULT_JOURNEY: DiscoverGroup[] = [
    {
        key: 'people', icon: 'ph:users-three',
        steps: [
            { key: 'citizens', route: '/citizens', doneKey: 'citizens' },
            { key: 'citizenData', route: '/citizens' },
            firstNote,
        ],
    },
    migration,
    getStarted,
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
    { key: 'carePlans', icon: 'ph:target', industries: null },
    { key: 'predefinedContent', icon: 'ph:list-bullets', industries: ['social_welfare', 'employment_services'] },
    // Quoting before treatment is a way of working, not a thing every clinic
    // does, and it exists for no other industry - so it is only worth asking a
    // dental clinic about. Keep this in sync with FEATURE_INDUSTRIES.priceEstimates
    // in useIndustryFeatures.ts.
    { key: 'priceEstimates', icon: 'ph:receipt', industries: ['dental'] },
]

/** The journey for an industry `system_name`, or the neutral one. Pure, for tests. */
export function journeyFor(systemName: string | null | undefined): DiscoverGroup[] {
    return (systemName && JOURNEYS[systemName]) || DEFAULT_JOURNEY
}

export function useDiscoverJourney(systemName: () => string | null | undefined) {
    const journey = computed<DiscoverGroup[]>(() => journeyFor(systemName()))

    const moduleOptions = computed(() => {
        const key = systemName()
        return MODULE_OPTIONS.filter(option =>
            option.industries === null || (!!key && option.industries.includes(key)))
    })

    return { journey, moduleOptions }
}
