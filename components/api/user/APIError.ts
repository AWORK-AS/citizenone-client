class APIError extends Error {
	errors?: Record<string, string[]>

	constructor(error: any) {
		super(error.message)
		Object.setPrototypeOf(this, APIError.prototype)
		if (error.errors) {
			this.errors = error.errors
		}
	}

	getErrorMessage() {
		return 'Something went wrong: ' + this.message
	}
}
export default APIError
