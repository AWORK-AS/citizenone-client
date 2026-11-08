/*
 * Superadmin colours as plain strings, for the few places that cannot take a
 * Tailwind class: ECharts options, SVG attributes, generated avatars, and
 * per-item colours chosen in script.
 *
 * Every value mirrors a token in tailwind.config.js. Change both together.
 * In templates, use the classes (text-ink-body, bg-success-soft, ...), not these.
 */
export const SA_COLORS = {
    ink: '#1F2533',
    inkBody: '#5C6478',
    inkMuted: '#8891A4',
    inkSubtle: '#B4BBC7',
    line: '#EAECF0',
    lineStrong: '#D5D9E2',
    canvas: '#F5F6F8',
    white: '#FFFFFF',

    primary: '#205E77', // tertiary
    primarySoft: '#E4F1F6', // tertiary-soft
    secondary: '#1B6D8A', // secondary
    teal: '#2DBAB2', // secondary-400
    accent: '#42AED9', // accent
    accentSoft: '#F0FAFD', // accent-soft
    sea: '#368F8B', // accent-sea
    seaSoft: '#EEF8F8', // accent-sea-soft
    seaInk: '#22706A', // accent-sea-ink

    success: '#2E9E33',
    successSoft: '#EDF7EE',
    successInk: '#1B6B1E',
    warning: '#D4900A',
    warningSoft: '#FFF9EC',
    warningInk: '#B45309',
    warningLine: '#F5D9A8',
    danger: '#CC3B2D',
    dangerSoft: '#FFF0F0',
    dangerInk: '#B42318',
    info: '#1A4D99',
    infoSoft: '#EEF4FB',
    infoInk: '#003080',
    plum: '#9B4D9B', // accent-purple family, charts only
} as const

/* Series colours for categorical charts and generated avatars, in the order they are handed out. */
export const SA_SERIES = [
    SA_COLORS.primary,
    SA_COLORS.success,
    SA_COLORS.sea,
    SA_COLORS.info,
    SA_COLORS.warning,
    SA_COLORS.plum,
] as const

/* Soft fill + ink pairs for initials avatars and category chips. */
export const SA_SOFT_PAIRS: ReadonlyArray<readonly [string, string]> = [
    [SA_COLORS.primarySoft, SA_COLORS.primary],
    [SA_COLORS.seaSoft, SA_COLORS.seaInk],
    [SA_COLORS.successSoft, SA_COLORS.successInk],
    [SA_COLORS.warningSoft, SA_COLORS.warningInk],
    [SA_COLORS.infoSoft, SA_COLORS.infoInk],
    [SA_COLORS.dangerSoft, SA_COLORS.dangerInk],
]
