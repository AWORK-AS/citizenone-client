/**
 * Wraps an async action so a second call while the first is still running returns the
 * first call's promise instead of starting another request.
 *
 * For actions where a repeat is harmful: minting a renewal link invalidates the previous
 * one, so a double click would kill the link the first click just received.
 */
export function singleFlight<A extends unknown[], R>(action: (...args: A) => Promise<R>): ((...args: A) => Promise<R>) & { isRunning: () => boolean } {
    let running: Promise<R> | null = null

    const wrapped = (...args: A): Promise<R> => {
        if (running) return running

        running = action(...args).finally(() => { running = null })
        return running
    }

    return Object.assign(wrapped, { isRunning: () => running !== null })
}
