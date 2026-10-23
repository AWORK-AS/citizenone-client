/**
 * What the send modal should do with the outcome of a secure mail send.
 *
 * The backend saves the message first and delivers after commit. When some
 * recipients cannot be reached it answers HTTP 400 with `saved: true` and a
 * translated message. The message exists then, so the modal must close and
 * refresh instead of showing an error and inviting a second send, which would
 * create a duplicate saved message.
 */
export type SecureMailSendOutcome =
    | { kind: 'sent' }
    | { kind: 'saved_not_delivered'; message: string }
    | { kind: 'failed' }

export function isSendSuccess(response: any): boolean {
    return response?.message === 'Success.' || response?.message === 'Succes.'
}

export function secureMailSendOutcome(response: any, error?: any): SecureMailSendOutcome {
    if (error) {
        if (error.saved === true) {
            return {
                kind: 'saved_not_delivered',
                message: typeof error.message === 'string' ? error.message : '',
            }
        }
        return { kind: 'failed' }
    }
    return isSendSuccess(response) ? { kind: 'sent' } : { kind: 'failed' }
}
