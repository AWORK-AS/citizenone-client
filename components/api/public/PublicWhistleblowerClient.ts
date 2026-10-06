/**
 * API client for the public whistleblower form. Deliberately does NOT extend
 * BaseAPIService: that class attaches the signed-in user's Bearer token from
 * localStorage, and a whistleblower report must not arrive with the sender's
 * identity attached. This client sends no credentials at all - the company
 * link token in the URL is what scopes the request.
 */
export class PublicWhistleblowerClient {
    private apiBaseURL: string

    private token: string

    constructor(apiBaseURL: string, token: string) {
        this.apiBaseURL = apiBaseURL.replace(/\/$/, '')
        this.token = token
    }

    async getForm(): Promise<any> {
        return this.request(`/public/whistleblower/${encodeURIComponent(this.token)}`)
    }

    async submit(payload: object): Promise<any> {
        return this.request(`/public/whistleblower/${encodeURIComponent(this.token)}/reports`, 'POST', payload)
    }

    private async request(path: string, method: string = 'GET', body?: object): Promise<any> {
        const response = await fetch(`${this.apiBaseURL}${path}`, {
            method,
            // No cookies either, in case the API ever moves to cookie sessions.
            credentials: 'omit',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
            throw { status: response.status, message: data?.message, errors: data?.errors }
        }

        return data
    }
}
