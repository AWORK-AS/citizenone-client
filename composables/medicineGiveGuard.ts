// "Giv medicin" may only register doses when it knows which doses are already given. Pure, for
// node --test; components/modules/user/citizen/medicine/modal-give-medicine.vue feeds it.
//
// Until 2026-10-19 a failed history lookup was swallowed: every slot showed as not given (and
// overdue), and the dialog let staff register a dose that had already been given.

export interface GiveGuardInput {
    multiDateMode: boolean
    /** The single date's history could not be loaded. */
    historyFailed: boolean
    /** The month's dosage status (used by multi-date mode) could not be loaded. */
    monthStatusFailed: boolean
}

export function doseRegistrationBlocked(input: GiveGuardInput): boolean {
    return input.multiDateMode ? input.monthStatusFailed : input.historyFailed
}
