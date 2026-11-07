/**
 * Whether a typed message holds a Danish CPR number (ddmmyy-xxxx, with a dash,
 * a space or nothing between the parts).
 *
 * Cody only ever sends the date part: the server keeps "ddmmyy-" and hides the
 * last four digits before anything reaches the AI. That happened silently, so
 * staff kept typing full CPR numbers. The composer uses this to tell them,
 * kindly, while they type.
 *
 * Same shape as PromptPiiScrubber::CPR_PATTERN on the server.
 */
const CPR = /(?<!\d)\d{6}[-\s]?\d{4}(?!\d)/

export function containsCpr(text: string | null | undefined): boolean {
    return CPR.test(String(text ?? ''))
}
