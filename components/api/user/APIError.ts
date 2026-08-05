class APIError extends Error {
	errors?: Record<string, string[]>

	/**
	 * The id the API assigned to the failing request. Support can look it up in
	 * the log instead of searching by timestamp, which is what the generic
	 * "something went wrong" message used to force.
	 */
	errorId?: string

	constructor(error: any) {
		super(error.message)
		Object.setPrototypeOf(this, APIError.prototype)
		if (error.errors) {
			this.errors = error.errors
		}
		if (error.errorId) {
			this.errorId = error.errorId
			this.message = `${this.message} (ID: ${error.errorId})`
		}
	}

	getErrorMessage() {
		return 'Something went wrong: ' + this.message
	}
}
export default APIError
