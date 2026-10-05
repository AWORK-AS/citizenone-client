/**
 * Permissions grouped by area, and the role × permission matrix built from them.
 *
 * The grouping used to live in the role form (components/modules/user/role/form.vue).
 * Settings → Roles → Permission overview has to group exactly the same way, or the
 * overview a customer prints would not match the form they edit roles in, so both
 * read it from here.
 *
 * No imports, on purpose: Node 22+ strips the type annotations and the unit tests
 * load this file directly. Run with:
 *
 *   node --test tests/unit/permissionGroups.test.mjs
 */

export const PERMISSION_GROUP_ORDER = ['citizen', 'journal', 'health', 'plan', 'calendar', 'economy', 'contact', 'reports', 'other']

const GROUP_LABELS: Record<string, Record<string, string>> = {
    citizen: { dk: '{Citizen}', en: '{Citizen}', no: '{Citizen}', sv: '{Citizen}' },
    journal: { dk: 'Journal & dokumenter', en: 'Journals & documents', no: 'Journal & dokumenter', sv: 'Journal & dokument' },
    health: { dk: 'Helbred & medicin', en: 'Health & medicine', no: 'Helse & medisin', sv: 'Hälsa & medicin' },
    plan: { dk: 'Planer & mål', en: 'Plans & goals', no: 'Planer & mål', sv: 'Planer & mål' },
    calendar: { dk: 'Kalender & vagtplan', en: 'Calendar & scheduling', no: 'Kalender & vaktplan', sv: 'Kalender & schema' },
    economy: { dk: 'Økonomi', en: 'Economy', no: 'Økonomi', sv: 'Ekonomi' },
    contact: { dk: 'Kontakter & pårørende', en: 'Contacts & relatives', no: 'Kontakter & pårørende', sv: 'Kontakter & anhöriga' },
    reports: { dk: 'Henvisninger & rapporter', en: 'Referrals & reports', no: 'Henvisninger & rapporter', sv: 'Hänvisningar & rapporter' },
    other: { dk: 'Andet', en: 'Other', no: 'Annet', sv: 'Övrigt' },
}
const CITIZEN_LEVEL = new Set(['create_citizen', 'update_citizen', 'link_citizen', 'manage_citizen_period', 'manage_employer_info'])

function upperFirst(value: string): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

export function permissionGroup(name: string): string {
    if (/citizen_journal|citizen_document/.test(name)) return 'journal'
    if (/citizen_health|citizen_medicine|nursing_professional_record_template|treatment_template/.test(name)) return 'health'
    if (/citizen_plan/.test(name)) return 'plan'
    if (/citizen_calendar|schedule/.test(name) || name === 'delete_calendar') return 'calendar'
    if (/citizen_economy/.test(name)) return 'economy'
    if (/citizen_contact|citizen_children/.test(name)) return 'contact'
    if (/referral|report/.test(name)) return 'reports'
    if (CITIZEN_LEVEL.has(name)) return 'citizen'
    return 'other'
}

/** @param citizenWord the company's own word for "citizen", i.e. `t('terms.citizen')` */
export function permissionGroupLabel(key: string, locale: string, citizenWord: string): string {
    const byLocale = GROUP_LABELS[key] || {}
    const label = byLocale[locale] || byLocale.en || key

    // The citizen word is the company's own, so it comes from i18n and not from the map above.
    return label.replace('{Citizen}', upperFirst(citizenWord))
}

// --- Permission matrix -----------------------------------------------------

/**
 * Roles from this level up pass every `hasEffectivePermission` check in the
 * backend whatever is stored on them, so the matrix shows them with full access
 * rather than with the partial set the seeders happened to store.
 */
export const FULL_ACCESS_LEVEL = 80

export interface MatrixRole {
    id: number
    name: string
    level: number
    fullAccess: boolean
    permissionUuids: Set<string>
    pageUuids: Set<string>
}

export interface MatrixRow {
    uuid: string
    label: string
    /** One entry per role, in the order of `PermissionMatrix.roles`. */
    granted: boolean[]
}

export interface MatrixBlock {
    rows: MatrixRow[]
    /** Granted rows per role, counted over `rows`. */
    counts: number[]
}

export interface MatrixGroup extends MatrixBlock {
    key: string
    label: string
}

export interface PermissionMatrix {
    roles: MatrixRole[]
    groups: MatrixGroup[]
    pages: MatrixBlock
}

export interface PermissionMatrixInput {
    roles: any[]
    permissions: any[]
    pages: any[]
    locale: string
    citizenWord: string
    /** Left out unless some role stores them, e.g. the superadmin panel's own permissions. */
    hiddenPermissionNames?: Set<string>
    search?: string
}

// Same as getPermissionLabel in composables/usePermissions.ts, which can't be
// imported here without pulling in the store.
function permissionLabel(permission: any, locale: string): string {
    return permission?.[`${locale}_name`] || permission?.name?.replace(/_/g, ' ') || ''
}

export function buildPermissionMatrix(input: PermissionMatrixInput): PermissionMatrix {
    const q = (input.search ?? '').trim().toLowerCase()
    const matches = (label: string) => !q || label.toLowerCase().includes(q)

    const roles: MatrixRole[] = (input.roles ?? [])
        .map((role: any) => {
            const level = Number(role?.level ?? 0)
            return {
                id: role?.id,
                name: role?.name ?? '',
                level,
                fullAccess: level >= FULL_ACCESS_LEVEL,
                permissionUuids: new Set<string>((role?.permissions ?? []).map((p: any) => p?.uuid)),
                pageUuids: new Set<string>((role?.pages ?? []).map((p: any) => p?.uuid)),
            }
        })
        .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name))

    const counts = (rows: MatrixRow[]) => roles.map((_, i) => rows.filter((row) => row.granted[i]).length)

    const hidden = input.hiddenPermissionNames ?? new Set<string>()
    const storedByARole = (uuid: string) => roles.some((role) => role.permissionUuids.has(uuid))

    const permissionRows = (input.permissions ?? [])
        .filter((p: any) => !hidden.has(p?.name) || storedByARole(p?.uuid))
        .map((p: any) => ({
            group: permissionGroup(p?.name || ''),
            row: {
                uuid: p?.uuid,
                label: permissionLabel(p, input.locale),
                granted: roles.map((role) => role.fullAccess || role.permissionUuids.has(p?.uuid)),
            } as MatrixRow,
        }))
        .filter(({ row }) => matches(row.label))

    const groups: MatrixGroup[] = PERMISSION_GROUP_ORDER
        .map((key) => {
            const rows = permissionRows.filter((p) => p.group === key).map((p) => p.row)
            return {
                key,
                label: permissionGroupLabel(key, input.locale, input.citizenWord),
                rows,
                counts: counts(rows),
            }
        })
        .filter((group) => group.rows.length > 0)

    // Page access has no level rule in the backend, so a full-access role shows
    // only the pages it was actually given.
    const pageRows: MatrixRow[] = (input.pages ?? [])
        .map((page: any) => ({
            uuid: page?.uuid,
            label: page?.name ?? '',
            granted: roles.map((role) => role.pageUuids.has(page?.uuid)),
        }))
        .sort((a: MatrixRow, b: MatrixRow) => a.label.localeCompare(b.label))
        .filter((row: MatrixRow) => matches(row.label))

    return { roles, groups, pages: { rows: pageRows, counts: counts(pageRows) } }
}

export interface PermissionMatrixCsvLabels {
    area: string
    permission: string
    page: string
    pageAccess: string
}

/**
 * The matrix as CSV text: Area; Permission; one column per role, then a blank
 * line and the page access block in the same shape. No BOM - the caller adds it
 * when it makes the file.
 */
export function permissionMatrixCsv(matrix: PermissionMatrix, roleLabels: string[], labels: PermissionMatrixCsvLabels): string {
    const ticks = (granted: boolean[]) => granted.map((isGranted) => (isGranted ? 'x' : ''))
    const rows: string[][] = [
        [labels.area, labels.permission, ...roleLabels],
        ...matrix.groups.flatMap((group) => group.rows.map((row) => [group.label, row.label, ...ticks(row.granted)])),
        [],
        [labels.area, labels.page, ...roleLabels],
        ...matrix.pages.rows.map((row) => [labels.pageAccess, row.label, ...ticks(row.granted)]),
    ]

    // Semicolon-delimited with every cell quoted, like the economy CSV export, so
    // Excel with a Danish locale splits the columns without an import dialog.
    return rows
        .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))
        .join('\r\n')
}
