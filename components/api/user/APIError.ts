class APIError extends Error {
	errors?: Record<string, string[]>

	/**
	 * The id the API assigned to the failing request. Support can look it up in
	 * the log instead of searching by timestamp, which is what the generic
	 * "something went wrong" message used to force.
	 */
	errorId?: string

	/**
	 * Some error responses carry a body alongside the message — e.g. a 409
	 * "you already have an active mileage trip" response also returns that
	 * trip as `data`, so the caller can adopt it instead of just failing.
	 * Optional and untyped on purpose: most callers never set or read it.
	 */
	data?: any

	/** HTTP status, when the caller needs to tell a rate limit from a failure. */
	status?: number

	/** Seconds until the request would be accepted again (429 only). */
	retryAfter?: number

	constructor(error: any) {
		super(error.message)
		Object.setPrototypeOf(this, APIError.prototype)
		// Carries through any one-off fields a specific endpoint's error body adds
		// (e.g. a 409 that also returns `pouring_empty: true`), so a caller that
		// needs one doesn't require bespoke wiring per feature. Runs before the
		// explicit assignments below so those still win over a same-named field.
		Object.assign(this, error)
		this.status = error.status
		this.retryAfter = error.retryAfter
		if (error.errors) {
			this.errors = error.errors
		}
		if (error.errorId) {
			this.errorId = error.errorId
			this.message = `${this.message} (ID: ${error.errorId})`
		}
		if (error.data !== undefined) {
			this.data = error.data
		}
	}

	getErrorMessage() {
		return 'Something went wrong: ' + this.message
	}
}
export default APIError
